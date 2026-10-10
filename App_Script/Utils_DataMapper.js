/**
 * ============================================================================
 * MODULE: Utils_DataMapper.gs
 * PURPOSE: Provides highly defensive, change-resilient schema mapping utilities,
 * centralized notification payload builders, and structural cache guards.
 * PRD/DESIGN REF: Section 6 / Phase D Auditor Remediation (V8 Optimization)
 * AUTHOR: Gemini Lead Engineer Gem
 * PROTOCOL: 100% Mirror Promotion & Pre-Compiled Index Map Compliant
 * AUDIT: Cycle 15 Cleared (CORE-MAP.01 Hardening Patch)
 * ============================================================================
 */

var Utils_DataMapper = (function () {
  
  return {
    /**
     * Transforms a raw 2D sheet array into an array of sanitized, strongly-typed objects.
     * ⚡ PHASE D/CYCLE 15 PATCH: Pre-compiles array index mappings ONCE outside the loop to 
     * eliminate heavy V8 string normalizations and Regex inside thousands of row iterations.
     * Resiliently handles spelling variations, spaces, and index drifts via 3-tier lookups.
     * * @param {Array<Array<*>>} rawRows - The raw 2D values from Sheet.getDataRange().getValues().
     * @param {Object} schemaMapping - Centralized layout definition (e.g., USR_COL, TX_COL).
     * @return {Array<Object>} Array of decoupled, structural record objects.
     */
    mapSheetRowsToObjects: function (rawRows, schemaMapping) {
      if (!rawRows || !Array.isArray(rawRows) || rawRows.length <= 1) {
        return [];
      }

      const headers = rawRows[0];
      const normalizeHeader = (h) => String(h || "").toUpperCase().trim().replace(/[\s_]+/g, "");

      // ⚡ V8 SPEED OPTIMIZATION: Pre-compile header index mapping vectors ONCE outside the loop
      const compiledVector = [];
      
      // Hash sheet headers to their physical column indices for O(1) matching speed
      const headerMap = {};
      for (let i = 0; i < headers.length; i++) {
        headerMap[normalizeHeader(headers[i])] = i;
      }

      // Resolve each configuration token defined in the schema to a structural column index
      if (schemaMapping && typeof schemaMapping === 'object') {
        for (const key in schemaMapping) {
          if (Object.prototype.hasOwnProperty.call(schemaMapping, key)) {
            const fieldDef = schemaMapping[key];
            let targetIndex = -1;

            if (fieldDef && typeof fieldDef === 'object') {
              // Tier 1: Match via normalized fieldDef.header string
              if (fieldDef.header) {
                const normHeader = normalizeHeader(fieldDef.header);
                if (headerMap[normHeader] !== undefined) {
                  targetIndex = headerMap[normHeader];
                }
              }
              
              // Tier 2: Fall back to matching via normalized structural schema Key name
              if (targetIndex === -1) {
                const normKey = normalizeHeader(key);
                if (headerMap[normKey] !== undefined) {
                  targetIndex = headerMap[normKey];
                }
              }

              // Tier 3: Fall back to static schema index if valid and within physical bounds
              if (targetIndex === -1 && typeof fieldDef.index === 'number' && fieldDef.index >= 0 && fieldDef.index < headers.length) {
                targetIndex = fieldDef.index;
              }
            } else if (typeof fieldDef === 'number' || typeof fieldDef === 'string') {
              // Graceful primitive schema parsing fallback
              const normField = normalizeHeader(fieldDef);
              if (headerMap[normField] !== undefined) {
                targetIndex = headerMap[normField];
              } else if (typeof fieldDef === 'number' && fieldDef >= 0 && fieldDef < headers.length) {
                targetIndex = fieldDef;
              }
            }

            // Append to our high-speed compilation vector only if securely resolved
            if (targetIndex >= 0 && targetIndex < headers.length) {
              compiledVector.push({
                key: key,
                index: targetIndex
              });
            }
          }
        }
      }

      // Hard Boundary Safety Shield: If optimization failed to resolve vectors, force sequential mapping
      if (compiledVector.length === 0) {
        Logger.log("⚠️ [Utils_DataMapper] Warning: Vector lookup failed to resolve dynamically. Triggering structural continuity matrix mapping.");
        for (let i = 0; i < headers.length; i++) {
          if (headers[i]) {
            compiledVector.push({ key: String(headers[i]).trim(), index: i });
          }
        }
      }

      // ⚡ HIGH-SPEED V8 ROW ITERATION LOOP: Zero regex, zero string mutations, flat vector parsing
      const rowCount = rawRows.length;
      const vectorCount = compiledVector.length;
      const resultObjects = new Array(rowCount - 1);

      for (let r = 1; r < rowCount; r++) {
        const row = rawRows[r];
        const recordObj = {};
        
        // Inline layout loop for minimized memory overhead and execution context preservation
        for (let v = 0; v < vectorCount; v++) {
          const vectorItem = compiledVector[v];
          recordObj[vectorItem.key] = row[vectorItem.index];
        }
        
        resultObjects[r - 1] = recordObj;
      }

      return resultObjects;
    },

    /**
     * Transforms a batch schema object structure into an authoritative row array vector.
     */
    mapBatchItemToRow: function (batchItem, schemaMapping) {
      const rowVector = new Array(Object.keys(schemaMapping).length);
      const assign = (key, val) => {
        if (schemaMapping[key]) {
          rowVector[schemaMapping[key].index] = val;
        }
      };

      // Underlying schema injection bindings
      assign("BOOKING_ID", batchItem.bookingId || "");
      assign("BATCH_ID", batchItem.batchId || "");
      assign("SUBMITTED_BY_USER_ID", batchItem.submittedByUserId || "");
      assign("USER", batchItem.user || "");
      assign("TARGET_USER_ID", batchItem.targetUserId || "");
      assign("TEACHER", batchItem.teacher || "");
      assign("SUBJECT", batchItem.subject || "");
      assign("LAB_ID", batchItem.labId || "");
      assign("LAB_NAME", batchItem.labName || "");
      assign("DATE", batchItem.date || "");
      assign("PERIOD", batchItem.period || "");
      assign("SECTION", batchItem.section || "");
      assign("DAY_TYPE", batchItem.dayType || "");
      assign("BELL_TYPE", batchItem.bellType || "");
      assign("START_TIME", batchItem.startTime || "");
      assign("END_TIME", batchItem.endTime || "");
      assign("REASON", batchItem.reason || "");
      assign("STATUS", batchItem.status || "");
      assign("CONFIRM_USER_ID", batchItem.confirmUserId || "");
      assign("CONFIRMED_BY", batchItem.confirmedBy || "");
      assign("ASSIGNED_TALT_ID", batchItem.assignedTaltId || "");
      assign("ASSIGNED_TALT_NAME", batchItem.assignedTaltName || "");

      return rowVector;
    },

    // Alias wrapper method to guarantee zero-regression if called via vector terminology upstream
    mapBatchItemToRowVector: function (batchItem, schemaMapping) {
      return this.mapBatchItemToRow(batchItem, schemaMapping);
    },

    /**
     * 🛡️ CACHE SERVICE LIMIT BOUNDARY SHIELD
     * Analyzes payload lengths to dynamically bypass cache before hitting a hard 100KB failure.
     */
    safelyCommitToScriptCache: function (cacheKey, payloadString, expirationSeconds = 21600) {
      if (!payloadString) return false;
      try {
        const payloadBlob = Utilities.newBlob(payloadString);
        const byteLength = payloadBlob.getBytes().length;
        
        // Strict 95KB threshold cushion check (97,280 Bytes)
        if (byteLength >= 97280) {
          Logger.log(`🚨 CACHE OVERFLOW SHIELD TRIGGERED: Blocked key [${cacheKey}]. Size: ${(byteLength / 1024).toFixed(2)}KB. Dropping execution safely to direct spreadsheet fallback.`);
          return false; 
        }
        
        CacheService.getScriptCache().put(cacheKey, payloadString, expirationSeconds);
        return true;
      } catch (err) {
        Logger.log(`🚨 [Utils_DataMapper.safelyCommitToScriptCache] Cache write failure: ${err.message}`);
        return false;
      }
    }
  };
})();