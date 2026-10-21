/**
 * 🧪 Google Apps Script Offline Test Stubs for Node.js
 * Enables testing pure business logic, gatekeepers, sanitization, and state machines
 * without requiring live Google Workspace connections.
 */

class MockSheet {
  constructor(name, data = []) {
    this.name = name;
    this.data = data.map(row => [...row]); // 2D array
  }

  getName() {
    return this.name;
  }

  getDataRange() {
    return {
      getValues: () => this.data.map(row => [...row]),
      setValues: (newVals) => {
        this.data = newVals.map(row => [...row]);
      }
    };
  }

  getLastRow() {
    return this.data.length;
  }

  getLastColumn() {
    return this.data.length > 0 ? this.data[0].length : 0;
  }

  appendRow(rowValues) {
    this.data.push([...rowValues]);
    return this;
  }

  getRange(row, col, numRows = 1, numCols = 1) {
    const rIdx = row - 1;
    const cIdx = col - 1;

    return {
      getValue: () => {
        if (this.data[rIdx] && this.data[rIdx][cIdx] !== undefined) {
          return this.data[rIdx][cIdx];
        }
        return '';
      },
      setValue: (val) => {
        while (this.data.length <= rIdx) {
          this.data.push([]);
        }
        while (this.data[rIdx].length <= cIdx) {
          this.data[rIdx].push('');
        }
        this.data[rIdx][cIdx] = val;
      },
      getValues: () => {
        const out = [];
        for (let r = 0; r < numRows; r++) {
          const rowArr = [];
          for (let c = 0; c < numCols; c++) {
            const v = (this.data[rIdx + r] && this.data[rIdx + r][cIdx + c] !== undefined)
              ? this.data[rIdx + r][cIdx + c]
              : '';
            rowArr.push(v);
          }
          out.push(rowArr);
        }
        return out;
      },
      setValues: (matrix) => {
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            const targetR = rIdx + r;
            const targetC = cIdx + c;
            while (this.data.length <= targetR) {
              this.data.push([]);
            }
            while (this.data[targetR].length <= targetC) {
              this.data[targetR].push('');
            }
            this.data[targetR][targetC] = matrix[r][c];
          }
        }
      }
    };
  }
}

class MockSpreadsheet {
  constructor(id, sheetsMap = {}) {
    this.id = id;
    this.sheets = {};
    for (const [name, data] of Object.entries(sheetsMap)) {
      this.sheets[name] = new MockSheet(name, data);
    }
  }

  getSheetByName(name) {
    return this.sheets[name] || null;
  }

  getSheets() {
    return Object.values(this.sheets);
  }

  insertSheet(name) {
    const s = new MockSheet(name, []);
    this.sheets[name] = s;
    return s;
  }
}

class MockLock {
  constructor() {
    this.hasLock = false;
  }

  tryLock(timeoutMs) {
    this.hasLock = true;
    return true;
  }

  waitLock(timeoutMs) {
    this.hasLock = true;
  }

  releaseLock() {
    this.hasLock = false;
  }
}

class MockCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    return this.store.get(key) || null;
  }

  put(key, value, expirationInSeconds) {
    this.store.set(key, String(value));
  }

  remove(key) {
    this.store.delete(key);
  }

  removeAll(keys) {
    keys.forEach(k => this.store.delete(k));
  }
}

class MockProperties {
  constructor(initial = {}) {
    this.properties = { ...initial };
  }

  getProperty(key) {
    return this.properties[key] || null;
  }

  setProperty(key, value) {
    this.properties[key] = String(value);
  }

  getProperties() {
    return { ...this.properties };
  }

  setProperties(newProps, deleteAllOthers = false) {
    if (deleteAllOthers) {
      this.properties = { ...newProps };
    } else {
      Object.assign(this.properties, newProps);
    }
  }

  deleteProperty(key) {
    delete this.properties[key];
  }
}

function createGasStubs(config = {}) {
  let activeUserEmail = config.activeUserEmail || 'teacher.bal@mahidol.ac.th';
  let effectiveUserEmail = config.effectiveUserEmail || 'nattapat.poo@mahidol.ac.th';
  
  const spreadsheets = new Map();
  const scriptProperties = new MockProperties(config.scriptProperties || {
    LOCAL_SPREADSHEET_ID: 'mock-local-sheet-id',
    MASTER_DB_ID: 'mock-master-db-id',
    TIMETABLE_2026_ID: 'mock-timetable-id',
    CALENDAR_ID: 'mock-calendar-id@group.calendar.google.com',
    SUPERADMIN_EMAILS: 'nattapat.poo@mahidol.ac.th'
  });

  const scriptCache = new MockCache();
  const globalLock = new MockLock();

  const Session = {
    getActiveUser: () => ({
      getEmail: () => activeUserEmail
    }),
    getEffectiveUser: () => ({
      getEmail: () => effectiveUserEmail
    }),
    _setActiveUserEmail: (email) => { activeUserEmail = email; },
    _setEffectiveUserEmail: (email) => { effectiveUserEmail = email; }
  };

  const SpreadsheetApp = {
    openById: (id) => {
      if (!spreadsheets.has(id)) {
        spreadsheets.set(id, new MockSpreadsheet(id));
      }
      return spreadsheets.get(id);
    },
    getActiveSpreadsheet: () => {
      const defaultId = scriptProperties.getProperty('LOCAL_SPREADSHEET_ID');
      return SpreadsheetApp.openById(defaultId);
    },
    flush: () => {
      // Mock flush
    },
    _seedSpreadsheet: (id, sheetsMap) => {
      spreadsheets.set(id, new MockSpreadsheet(id, sheetsMap));
    }
  };

  const LockService = {
    getScriptLock: () => globalLock,
    getUserLock: () => new MockLock(),
    getDocumentLock: () => new MockLock()
  };

  const CacheService = {
    getScriptCache: () => scriptCache,
    getUserCache: () => new MockCache(),
    getDocumentCache: () => new MockCache()
  };

  const PropertiesService = {
    getScriptProperties: () => scriptProperties,
    getUserProperties: () => new MockProperties(),
    getDocumentProperties: () => new MockProperties()
  };

  const Utilities = {
    getUuid: () => {
      let d = Date.now();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
    },
    formatDate: (date, tz, format) => {
      return date.toISOString().slice(0, 10);
    }
  };

  return {
    Session,
    SpreadsheetApp,
    LockService,
    CacheService,
    PropertiesService,
    Utilities
  };
}

module.exports = {
  createGasStubs,
  MockSheet,
  MockSpreadsheet,
  MockLock,
  MockCache,
  MockProperties
};
