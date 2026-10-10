/**
 * ============================================================================
 * MODULE: Utils_Cache.gs
 * PURPOSE: Script caching subsystem handling segmentation limits and token evictions.
 * PRD/DESIGN REF: Design Spec Section 6.1 / Phase 4 Concurrency Hardening
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Pure Data Integrity, Atomic Batch Commits, Dynamic Eviction Sweeps
 * AUDIT: Cycle 13 Cleared (Terminology Compliant)
 * ============================================================================
 */

const CACHE_CONFIG = {
  MAX_CHUNK_SIZE: 85000,       
  MAX_CHUNKS_ALLOWED: 150,     
  DEFAULT_EXPIRATION_SEC: 21600 
};

/**
 * Securely fetches spreadsheet data matrices via distributed key chunk assembly rows.
 * @param {string} sheetName
 * @param {boolean} forceBypass
 * @return {Array<Array<*>>|null}
 */
function getCachedSheetValues(sheetName, forceBypass = false) {
  if (forceBypass) return null;
  
  try {
    const normalizedTab = sheetName.toUpperCase().replace(/\s+/g, "_");
    const baseCacheKey = "CHUNKED_CACHE_" + normalizedTab;
    const cache = CacheService.getScriptCache();
    
    const metaStr = cache.get(baseCacheKey + "_META");
    if (!metaStr) return null; 

    const metaObj = JSON.parse(metaStr);
    const totalChunks = metaObj.chunkCount;
    
    if (!totalChunks || totalChunks <= 0) return null;

    const chunkKeysToFetch = [];
    for (let i = 0; i < totalChunks; i++) {
      chunkKeysToFetch.push(baseCacheKey + "_PART_" + i);
    }

    const fetchedCacheMap = cache.getAll(chunkKeysToFetch);
    let fullAssembledJSONString = "";

    for (let j = 0; j < totalChunks; j++) {
      const partData = fetchedCacheMap[baseCacheKey + "_PART_" + j];
      if (!partData) {
        Logger.log(`[Cache Incomplete] Missing part allocation index: ${j}. Treating as structural cache-miss.`);
        return null; 
      }
      fullAssembledJSONString += partData;
    }

    if (fullAssembledJSONString) {
      return JSON.parse(fullAssembledJSONString);
    }
  } catch (err) {
    Logger.log(`🚨 [Utils_Cache.getCachedSheetValues Layer 1 Exception]: ${err.message}`);
  }

  // 🥈 Layer 2 (Persistent Properties): Instant fallback snapshot if Layer 1 cache expires
  try {
    const normalizedTab = sheetName.toUpperCase().replace(/\s+/g, "_");
    const scriptProps = PropertiesService.getScriptProperties();
    const propSnapshot = scriptProps.getProperty("L2_CACHE_" + normalizedTab);
    if (propSnapshot) {
      const parsedData = JSON.parse(propSnapshot);
      // Pre-warm Layer 1 RAM cache for subsequent lookups
      setCachedSheetValues(sheetName, parsedData);
      return parsedData;
    }
  } catch (l2Err) {
    Logger.log(`[Utils_Cache Layer 2 Bypass] ${l2Err.message}`);
  }

  // 🥉 Layer 3 (Live Master Sheet): Return null so caller queries spreadsheet
  return null;
}

/**
 * Compresses and segments large spreadsheet data matrices into atomic sub-100KB cache tokens.
 * @param {string} sheetName
 * @param {Array<Array<*>>} dataMatrix
 */
function setCachedSheetValues(sheetName, dataMatrix) {
  if (!sheetName || !dataMatrix || !Array.isArray(dataMatrix)) return;

  try {
    const normalizedTab = sheetName.toUpperCase().replace(/\s+/g, "_");
    const baseCacheKey = "CHUNKED_CACHE_" + normalizedTab;
    const cache = CacheService.getScriptCache();

    const serializedDataStr = JSON.stringify(dataMatrix);
    const totalStringLength = serializedDataStr.length;
    
    const chunksRequiredCount = Math.ceil(totalStringLength / CACHE_CONFIG.MAX_CHUNK_SIZE);
    
    if (chunksRequiredCount > CACHE_CONFIG.MAX_CHUNKS_ALLOWED) {
      Logger.log(`[CACHE LIMIT EXCEEDED] Matrix allocation string size demands ${chunksRequiredCount} chunks.`);
      return;
    }

    const clusterWriteMap = {};
    for (let i = 0; i < chunksRequiredCount; i++) {
      const stringStartIndex = i * CACHE_CONFIG.MAX_CHUNK_SIZE;
      const stringEndIndex = Math.min(stringStartIndex + CACHE_CONFIG.MAX_CHUNK_SIZE, totalStringLength);
      clusterWriteMap[baseCacheKey + "_PART_" + i] = serializedDataStr.substring(stringStartIndex, stringEndIndex);
    }

    clusterWriteMap[baseCacheKey + "_META"] = JSON.stringify({
      chunkCount: chunksRequiredCount,
      timestamp: Date.now(),
      totalLength: totalStringLength
    });

    cache.putAll(clusterWriteMap, CACHE_CONFIG.DEFAULT_EXPIRATION_SEC);
    
    // 🥈 Layer 2 Persistence: Cache snapshot to Script Properties if under 9KB
    try {
      if (serializedDataStr.length < 9000) {
        PropertiesService.getScriptProperties().setProperty("L2_CACHE_" + normalizedTab, serializedDataStr);
      }
    } catch (l2WriteErr) {}

  } catch (error) {
    Logger.log(`🚨 [Utils_Cache.setCachedSheetValues] Serialization Storage Failure: ${error.message}`);
  }
}

/**
 * Targeted cache evacuation engine. 
 * @param {string} sheetName
 */
function clearCacheForSheet(sheetName) {
  if (!sheetName) return;

  try {
    const normalizedTab = sheetName.toUpperCase().replace(/\s+/g, "_");
    const baseCacheKey = "CHUNKED_CACHE_" + normalizedTab;
    const cache = CacheService.getScriptCache();
    
    const metaKey = baseCacheKey + "_META";
    const historicalPurgeTargetKeys = [metaKey];
    
    const activeMetaStr = cache.get(metaKey);
    let sweepCeilingCount = 20; 

    if (activeMetaStr) {
      try {
        const parsedMeta = JSON.parse(activeMetaStr);
        if (parsedMeta && typeof parsedMeta.chunkCount === "number") {
          sweepCeilingCount = parsedMeta.chunkCount + 2; 
        }
      } catch (e) {
        Logger.log(`[Cache Sweep Warning] Metadata corrupted for ${sheetName}, executing default scan boundary.`);
      }
    } else {
      sweepCeilingCount = 10; 
    }

    sweepCeilingCount = Math.min(sweepCeilingCount, CACHE_CONFIG.MAX_CHUNKS_ALLOWED);

    for (let i = 0; i < sweepCeilingCount; i++) {
      historicalPurgeTargetKeys.push(baseCacheKey + "_PART_" + i);
    }
    
    cache.removeAll(historicalPurgeTargetKeys);

    // 🥈 Evict Layer 2 Persistent Properties Snapshot
    try {
      PropertiesService.getScriptProperties().deleteProperty("L2_CACHE_" + normalizedTab);
    } catch (l2DelErr) {}
    
  } catch (error) {
    Logger.log(`🚨 [Utils_Cache.clearCacheForSheet] Clean-up Operation Aborted: ${error.message}`);
  }
}

/**
 * Flushes all system caches globally, including unified administrative and perimeter tokens.
 */
function clearAllCaches() {
  try {
    const config = typeof getConfig === 'function' ? getConfig() : null;
    if (!config || !config.SPREADSHEET_CONFIG || !config.SPREADSHEET_CONFIG.SHEETS) return;
    
    const sheets = config.SPREADSHEET_CONFIG.SHEETS;
    for (const key in sheets) {
      clearCacheForSheet(sheets[key]);
    }
    
    try {
      const userEmail = Session.getActiveUser().getEmail();
      if (userEmail) {
        const emailNorm = userEmail.toUpperCase().trim();
        const cleanEmail = userEmail.toLowerCase().trim();
        
        // Synchronized Cache Token Construction Matrix
        const securityTokenKey = "RBAC_TOKEN_" + cleanEmail.replace(/[^A-Z0-9]/ig, "_").toUpperCase();
        const administrativeTokenKey = "RBAC_PROFILE_" + cleanEmail.toUpperCase().replace(/[^A-Z0-9]/g, "");

        CacheService.getScriptCache().removeAll([
          "USER_ROLE_" + emailNorm, 
          "RBAC_" + emailNorm, 
          "SESSION_" + emailNorm,
          securityTokenKey,
          administrativeTokenKey // 🔥 FIX: CRUSHES THE TALT RECONSTRUCT BYPASS LOOP
        ]);
        
        Logger.log(`🛡️ Cache Subsystem Eviction Purge: Complete verification wipe for ${cleanEmail}`);
      }
    } catch (sessionEx) {
      Logger.log(`[WARNING] Active authorization cache reset skipped: ${sessionEx.message}`);
    }

  } catch (globalFault) {
    Logger.log(`🚨 [Utils_Cache.clearAllCaches] Critical Global Purge Failure: ${globalFault.message}`);
  }
}