/**
 * ============================================================================
 * StockFlow Inventory Management System - Database.gs
 * Google Sheets Data Access Layer (CRUD, auto-initialization, indexing)
 * ============================================================================
 */

var Database = {
  /**
   * Returns the spreadsheet instance (bound or standalone by ID)
   */
  getSpreadsheet: function() {
    if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== '') {
      return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    }
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  /**
   * Retrieves or initializes a sheet tab with configured column headers
   */
  getSheet: function(sheetName) {
    var ss = this.getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var schema = CONFIG.SCHEMAS[sheetName];
      if (schema && schema.length > 0) {
        var headerRange = sheet.getRange(1, 1, 1, schema.length);
        headerRange.setValues([schema]);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#F1F5F9');
        headerRange.setFontColor('#0F172A');
        sheet.setFrozenRows(1);
      }
    }
    return sheet;
  },

  /**
   * Initializes all required system sheets and schemas in one call
   */
  initializeDatabase: function() {
    var self = this;
    var keys = Object.keys(CONFIG.SHEETS);
    var results = {};
    
    keys.forEach(function(key) {
      var sheetName = CONFIG.SHEETS[key];
      self.getSheet(sheetName);
      results[sheetName] = 'Initialized';
    });
    
    return {
      status: 'success',
      message: 'All inventory database sheets initialized successfully.',
      tables: results
    };
  },

  /**
   * Reads all rows from a sheet as an array of JavaScript objects
   */
  getAll: function(sheetName) {
    var sheet = this.getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1 || lastCol === 0) {
      return [];
    }
    
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    var records = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var record = {};
      var hasValue = false;
      
      for (var j = 0; j < headers.length; j++) {
        var val = row[j];
        if (val !== '' && val !== null && val !== undefined) {
          hasValue = true;
        }
        record[headers[j]] = val;
      }
      
      if (hasValue && record.id) {
        records.push(record);
      }
    }
    
    return records;
  },

  /**
   * Finds a single record by its ID in a sheet
   */
  getById: function(sheetName, id) {
    var all = this.getAll(sheetName);
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === String(id)) {
        return all[i];
      }
    }
    return null;
  },

  /**
   * Appends a new record to the sheet
   */
  insert: function(sheetName, recordData) {
    var sheet = this.getSheet(sheetName);
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    var rowValues = [];
    for (var j = 0; j < headers.length; j++) {
      var field = headers[j];
      var val = recordData[field];
      rowValues.push(val !== undefined && val !== null ? val : '');
    }
    
    sheet.appendRow(rowValues);
    return recordData;
  },

  /**
   * Updates an existing row by ID
   */
  update: function(sheetName, id, updateData) {
    var sheet = this.getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1) return null;
    
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var idColIdx = headers.indexOf('id');
    if (idColIdx === -1) idColIdx = 0;
    
    var idRange = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues();
    
    var targetRowIdx = -1;
    for (var i = 0; i < idRange.length; i++) {
      if (String(idRange[i][0]) === String(id)) {
        targetRowIdx = i + 2; // 1-based index + header row
        break;
      }
    }
    
    if (targetRowIdx === -1) {
      throw new Error('Record with ID ' + id + ' not found in ' + sheetName);
    }
    
    var currentRowValues = sheet.getRange(targetRowIdx, 1, 1, lastCol).getValues()[0];
    var currentObj = {};
    for (var j = 0; j < headers.length; j++) {
      currentObj[headers[j]] = currentRowValues[j];
    }
    
    // Merge updateData into currentObj
    var merged = Object.assign({}, currentObj, updateData);
    var newRowValues = [];
    for (var k = 0; k < headers.length; k++) {
      var f = headers[k];
      newRowValues.push(merged[f] !== undefined && merged[f] !== null ? merged[f] : '');
    }
    
    sheet.getRange(targetRowIdx, 1, 1, lastCol).setValues([newRowValues]);
    return merged;
  },

  /**
   * Deletes a record by ID from a sheet
   */
  delete: function(sheetName, id) {
    var sheet = this.getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;
    
    var idColIdx = 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var foundIdx = headers.indexOf('id');
    if (foundIdx !== -1) idColIdx = foundIdx + 1;
    
    var ids = sheet.getRange(2, idColIdx, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        sheet.deleteRow(i + 2);
        return true;
      }
    }
    return false;
  }
};
