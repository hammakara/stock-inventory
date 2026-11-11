/**
 * Bundled Google Apps Script backend and HTML files for the interactive deployment studio
 */

export interface GasFileItem {
  name: string;
  type: 'gs' | 'html' | 'json';
  category: 'Backend (Google Apps Script)' | 'Frontend (HTML Service)' | 'Configuration';
  description: string;
  content: string;
}

export const ALL_IN_ONE_SCRIPT = `/**
 * ============================================================================
 * StockFlow Inventory Management System - ALL-IN-ONE BOOTSTRAP SCRIPT
 * Paste this entire script into your Google Sheet: Extensions > Apps Script
 * Click: Deploy > New Deployment > Web app > Execute as Me > Access: Anyone
 * ============================================================================
 */

var CONFIG = {
  APP_TITLE: 'StockFlow - Inventory Management System',
  VERSION: '1.0.0',
  CURRENCY_SYMBOL: '$',
  SHEETS: {
    PRODUCTS: 'Products',
    CATEGORIES: 'Categories',
    SUPPLIERS: 'Suppliers',
    CUSTOMERS: 'Customers',
    TRANSACTIONS: 'Transactions',
    ADJUSTMENTS: 'Adjustments',
    USERS: 'Users',
    SETTINGS: 'Settings'
  },
  SCHEMAS: {
    Products: ['id', 'sku', 'barcode', 'name', 'categoryId', 'categoryName', 'supplierId', 'supplierName', 'unit', 'costPrice', 'sellingPrice', 'minimumStock', 'currentStock', 'status', 'location', 'description', 'createdAt', 'updatedAt'],
    Categories: ['id', 'name', 'slug', 'description', 'color', 'status', 'createdAt'],
    Suppliers: ['id', 'companyName', 'contactPerson', 'email', 'phone', 'address', 'leadTimeDays', 'paymentTerms', 'status', 'createdAt'],
    Customers: ['id', 'name', 'company', 'email', 'phone', 'address', 'status', 'totalOrders', 'createdAt'],
    Transactions: ['id', 'date', 'type', 'productId', 'productName', 'productSku', 'quantity', 'previousStock', 'newStock', 'unitPrice', 'totalValue', 'referenceNumber', 'supplierOrCustomer', 'notes', 'userId', 'userName', 'reason'],
    Adjustments: ['id', 'date', 'productId', 'productName', 'productSku', 'previousStock', 'adjustedStock', 'difference', 'reason', 'referenceNumber', 'notes', 'userId', 'userName'],
    Users: ['id', 'name', 'email', 'role', 'status', 'lastLogin'],
    Settings: ['key', 'value', 'updatedAt']
  }
};

var Database = {
  getSpreadsheet: function() { return SpreadsheetApp.getActiveSpreadsheet(); },
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
        sheet.setFrozenRows(1);
      }
    }
    return sheet;
  },
  initializeDatabase: function() {
    var self = this;
    var keys = Object.keys(CONFIG.SHEETS);
    var results = {};
    keys.forEach(function(k) {
      var name = CONFIG.SHEETS[k];
      self.getSheet(name);
      results[name] = 'Initialized';
    });
    return { status: 'success', message: 'All tables initialized.', tables: results };
  },
  getAll: function(sheetName) {
    var sheet = this.getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) return [];
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var records = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var record = {};
      var hasVal = false;
      for (var j = 0; j < headers.length; j++) {
        var v = row[j];
        if (v !== '' && v !== null && v !== undefined) hasVal = true;
        record[headers[j]] = v;
      }
      if (hasVal && record.id) records.push(record);
    }
    return records;
  },
  getById: function(sheetName, id) {
    var all = this.getAll(sheetName);
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === String(id)) return all[i];
    }
    return null;
  },
  insert: function(sheetName, recordData) {
    var sheet = this.getSheet(sheetName);
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var rowValues = [];
    for (var j = 0; j < headers.length; j++) {
      var val = recordData[headers[j]];
      rowValues.push(val !== undefined && val !== null ? val : '');
    }
    sheet.appendRow(rowValues);
    return recordData;
  },
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
      if (String(idRange[i][0]) === String(id)) { targetRowIdx = i + 2; break; }
    }
    if (targetRowIdx === -1) throw new Error('Record not found in ' + sheetName);
    var currentRowValues = sheet.getRange(targetRowIdx, 1, 1, lastCol).getValues()[0];
    var currentObj = {};
    for (var j = 0; j < headers.length; j++) currentObj[headers[j]] = currentRowValues[j];
    var merged = Object.assign({}, currentObj, updateData);
    var newRowValues = [];
    for (var k = 0; k < headers.length; k++) {
      var f = headers[k];
      newRowValues.push(merged[f] !== undefined && merged[f] !== null ? merged[f] : '');
    }
    sheet.getRange(targetRowIdx, 1, 1, lastCol).setValues([newRowValues]);
    return merged;
  }
};

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    version: CONFIG.VERSION,
    message: 'StockFlow Google Apps Script API Ready',
    spreadsheetTitle: SpreadsheetApp.getActiveSpreadsheet().getName()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '{}';
    var payload = JSON.parse(raw);
    var action = payload.action;
    var data = payload.data || payload;

    if (action === 'bulkSync') {
      Database.initializeDatabase();
      if (data.products && Array.isArray(data.products)) {
        data.products.forEach(function(p) {
          try {
            var ex = Database.getById(CONFIG.SHEETS.PRODUCTS, p.id);
            if (ex) Database.update(CONFIG.SHEETS.PRODUCTS, p.id, p);
            else Database.insert(CONFIG.SHEETS.PRODUCTS, p);
          } catch (e) {}
        });
      }
      if (data.transactions && Array.isArray(data.transactions)) {
        data.transactions.forEach(function(t) {
          try {
            var ex2 = Database.getById(CONFIG.SHEETS.TRANSACTIONS, t.id);
            if (!ex2) Database.insert(CONFIG.SHEETS.TRANSACTIONS, t);
          } catch (e) {}
        });
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Sync completed',
        syncedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      action: action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function initDatabase() {
  return Database.initializeDatabase();
}
`;

export const GAS_FILES: GasFileItem[] = [
  {
    name: 'Code.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'Main router, doGet / doPost entry points, and google.script.run bridge endpoints.',
    content: `/**
 * ============================================================================
 * StockFlow Inventory Management System - Code.gs
 * Main entry point for Google Apps Script (HTML Service & Web App API)
 * ============================================================================
 */

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle(CONFIG.APP_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '{}';
    var payload = JSON.parse(raw);
    var action = payload.action;
    var data = payload.data || payload;
    
    var result = processAction(action, data);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message || err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function handleApiRequest(action, params) {
  try {
    var result = processAction(action, params);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      version: CONFIG.VERSION,
      message: 'StockFlow Google Apps Script API Ready',
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message || err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function processAction(action, data) {
  switch (action) {
    case 'ping':
      return {
        status: 'online',
        timestamp: new Date().toISOString(),
        version: CONFIG.VERSION,
        spreadsheetTitle: Database.getSpreadsheet().getName()
      };
    case 'initDatabase':
      return Database.initializeDatabase();
    case 'getProducts':
      return ProductService.getAllProducts();
    case 'saveProduct':
      return ProductService.saveProduct(data);
    case 'deleteProduct':
      return ProductService.deleteProduct(data.id);
    case 'getCategories':
      return CategoryService.getAllCategories();
    case 'saveCategory':
      return CategoryService.saveCategory(data);
    case 'deleteCategory':
      return CategoryService.deleteCategory(data.id);
    case 'getSuppliers':
      return SupplierService.getAllSuppliers();
    case 'saveSupplier':
      return SupplierService.saveSupplier(data);
    case 'deleteSupplier':
      return SupplierService.deleteSupplier(data.id);
    case 'stockIn':
      return InventoryService.recordStockIn(data);
    case 'stockOut':
      return InventoryService.recordStockOut(data);
    case 'stockAdjustment':
      return InventoryService.recordAdjustment(data);
    case 'getTransactions':
      return InventoryService.getAllTransactions();
    case 'getValuationReport':
      return ReportService.getValuationReport();
    case 'getLowStockReport':
      return ReportService.getLowStockReport();
    case 'getDashboardMetrics':
      return ReportService.getDashboardMetrics();
    default:
      throw new Error('Unknown action: ' + action);
  }
}

function apiGetProducts() { return processAction('getProducts', {}); }
function apiSaveProduct(p) { return processAction('saveProduct', p); }
function apiDeleteProduct(id) { return processAction('deleteProduct', { id: id }); }
function apiGetCategories() { return processAction('getCategories', {}); }
function apiSaveCategory(c) { return processAction('saveCategory', c); }
function apiGetSuppliers() { return processAction('getSuppliers', {}); }
function apiSaveSupplier(s) { return processAction('saveSupplier', s); }
function apiStockIn(d) { return processAction('stockIn', d); }
function apiStockOut(d) { return processAction('stockOut', d); }
function apiStockAdjustment(d) { return processAction('stockAdjustment', d); }
function apiGetTransactions() { return processAction('getTransactions', {}); }
function apiGetDashboardMetrics() { return processAction('getDashboardMetrics', {}); }
function apiGetValuationReport() { return processAction('getValuationReport', {}); }
function apiGetLowStockReport() { return processAction('getLowStockReport', {}); }`
  },
  {
    name: 'Config.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'System configurations, sheet tab names, and column schemas.',
    content: `var CONFIG = {
  SPREADSHEET_ID: '', // Leave blank if script is container-bound to the Google Sheet
  APP_TITLE: 'StockFlow - Inventory Management System',
  VERSION: '1.0.0',
  CURRENCY_SYMBOL: '$',
  SHEETS: {
    PRODUCTS: 'Products',
    CATEGORIES: 'Categories',
    SUPPLIERS: 'Suppliers',
    CUSTOMERS: 'Customers',
    TRANSACTIONS: 'Transactions',
    ADJUSTMENTS: 'Adjustments',
    USERS: 'Users',
    SETTINGS: 'Settings'
  },
  SCHEMAS: {
    Products: ['id', 'sku', 'barcode', 'name', 'categoryId', 'categoryName', 'supplierId', 'supplierName', 'unit', 'costPrice', 'sellingPrice', 'minimumStock', 'currentStock', 'status', 'location', 'description', 'createdAt', 'updatedAt'],
    Categories: ['id', 'name', 'slug', 'description', 'color', 'status', 'createdAt'],
    Suppliers: ['id', 'companyName', 'contactPerson', 'email', 'phone', 'address', 'leadTimeDays', 'paymentTerms', 'status', 'createdAt'],
    Customers: ['id', 'name', 'company', 'email', 'phone', 'address', 'status', 'totalOrders', 'createdAt'],
    Transactions: ['id', 'date', 'type', 'productId', 'productName', 'productSku', 'quantity', 'previousStock', 'newStock', 'unitPrice', 'totalValue', 'referenceNumber', 'supplierOrCustomer', 'notes', 'userId', 'userName', 'reason'],
    Adjustments: ['id', 'date', 'productId', 'productName', 'productSku', 'previousStock', 'adjustedStock', 'difference', 'reason', 'referenceNumber', 'notes', 'userId', 'userName'],
    Users: ['id', 'name', 'email', 'role', 'status', 'lastLogin'],
    Settings: ['key', 'value', 'updatedAt']
  },
  ROLES: { ADMIN: 'Admin', MANAGER: 'Inventory Manager', STAFF: 'Staff' }
};`
  },
  {
    name: 'Database.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'Data Access Layer for Google Sheets (auto-table creation, query, insert, update, delete).',
    content: `var Database = {
  getSpreadsheet: function() {
    if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== '') {
      return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    }
    return SpreadsheetApp.getActiveSpreadsheet();
  },
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
        sheet.setFrozenRows(1);
      }
    }
    return sheet;
  },
  initializeDatabase: function() {
    var self = this;
    var keys = Object.keys(CONFIG.SHEETS);
    var results = {};
    keys.forEach(function(key) {
      var sheetName = CONFIG.SHEETS[key];
      self.getSheet(sheetName);
      results[sheetName] = 'Initialized';
    });
    return { status: 'success', message: 'All sheets initialized.', tables: results };
  },
  getAll: function(sheetName) {
    var sheet = this.getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) return [];
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var records = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var record = {};
      var hasValue = false;
      for (var j = 0; j < headers.length; j++) {
        var val = row[j];
        if (val !== '' && val !== null && val !== undefined) hasValue = true;
        record[headers[j]] = val;
      }
      if (hasValue && record.id) records.push(record);
    }
    return records;
  },
  getById: function(sheetName, id) {
    var all = this.getAll(sheetName);
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === String(id)) return all[i];
    }
    return null;
  },
  insert: function(sheetName, recordData) {
    var sheet = this.getSheet(sheetName);
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var rowValues = [];
    for (var j = 0; j < headers.length; j++) {
      var val = recordData[headers[j]];
      rowValues.push(val !== undefined && val !== null ? val : '');
    }
    sheet.appendRow(rowValues);
    return recordData;
  },
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
        targetRowIdx = i + 2;
        break;
      }
    }
    if (targetRowIdx === -1) throw new Error('Record not found in ' + sheetName);
    var currentRowValues = sheet.getRange(targetRowIdx, 1, 1, lastCol).getValues()[0];
    var currentObj = {};
    for (var j = 0; j < headers.length; j++) currentObj[headers[j]] = currentRowValues[j];
    var merged = Object.assign({}, currentObj, updateData);
    var newRowValues = [];
    for (var k = 0; k < headers.length; k++) {
      var f = headers[k];
      newRowValues.push(merged[f] !== undefined && merged[f] !== null ? merged[f] : '');
    }
    sheet.getRange(targetRowIdx, 1, 1, lastCol).setValues([newRowValues]);
    return merged;
  },
  delete: function(sheetName, id) {
    var sheet = this.getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var idColIdx = headers.indexOf('id') + 1 || 1;
    var ids = sheet.getRange(2, idColIdx, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        sheet.deleteRow(i + 2);
        return true;
      }
    }
    return false;
  }
};`
  },
  {
    name: 'ProductService.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'Product catalog CRUD and SKU management.',
    content: `var ProductService = {
  getAllProducts: function() {
    var products = Database.getAll(CONFIG.SHEETS.PRODUCTS);
    var categories = Database.getAll(CONFIG.SHEETS.CATEGORIES);
    var suppliers = Database.getAll(CONFIG.SHEETS.SUPPLIERS);
    var catMap = {}, supMap = {};
    categories.forEach(function(c) { catMap[c.id] = c.name; });
    suppliers.forEach(function(s) { supMap[s.id] = s.companyName; });
    return products.map(function(p) {
      return {
        id: p.id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        categoryId: p.categoryId,
        categoryName: catMap[p.categoryId] || p.categoryName || 'Unassigned',
        supplierId: p.supplierId,
        supplierName: supMap[p.supplierId] || p.supplierName || 'Unassigned',
        unit: p.unit || 'pcs',
        costPrice: Number(p.costPrice) || 0,
        sellingPrice: Number(p.sellingPrice) || 0,
        minimumStock: Number(p.minimumStock) || 0,
        currentStock: Number(p.currentStock) || 0,
        status: p.status || 'Active',
        location: p.location || '',
        description: p.description || '',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });
  },
  getProductById: function(id) { return Database.getById(CONFIG.SHEETS.PRODUCTS, id); },
  saveProduct: function(productData) {
    Validation.validateProduct(productData);
    var now = new Date().toISOString();
    if (productData.id && String(productData.id).trim() !== '') {
      productData.updatedAt = now;
      return Database.update(CONFIG.SHEETS.PRODUCTS, productData.id, productData);
    } else {
      var all = Database.getAll(CONFIG.SHEETS.PRODUCTS);
      productData.id = 'PROD-' + ('00' + (all.length + 1)).slice(-3);
      productData.currentStock = Number(productData.currentStock) || 0;
      productData.status = productData.status || 'Active';
      productData.createdAt = now;
      productData.updatedAt = now;
      return Database.insert(CONFIG.SHEETS.PRODUCTS, productData);
    }
  },
  deleteProduct: function(id) { return Database.delete(CONFIG.SHEETS.PRODUCTS, id); }
};`
  },
  {
    name: 'InventoryService.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'Transaction processor for Stock In, Out, and Adjustments with atomic stock updates.',
    content: `var InventoryService = {
  _generateTxnId: function() {
    var all = Database.getAll(CONFIG.SHEETS.TRANSACTIONS);
    var year = new Date().getFullYear();
    return 'TXN-' + year + '-' + ('000' + (all.length + 1)).slice(-4);
  },
  recordStockIn: function(params) {
    Validation.validateStockIn(params);
    var product = Database.getById(CONFIG.SHEETS.PRODUCTS, params.productId);
    if (!product) throw new Error('Product not found: ' + params.productId);
    var qty = Number(params.quantity);
    var prevStock = Number(product.currentStock) || 0;
    var newStock = prevStock + qty;
    var unitPrice = params.unitPrice ? Number(params.unitPrice) : (Number(product.costPrice) || 0);
    var now = new Date().toISOString();
    Database.update(CONFIG.SHEETS.PRODUCTS, product.id, { currentStock: newStock, updatedAt: now });
    var txn = {
      id: this._generateTxnId(),
      date: now,
      type: 'IN',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: qty,
      previousStock: prevStock,
      newStock: newStock,
      unitPrice: unitPrice,
      totalValue: qty * unitPrice,
      referenceNumber: params.referenceNumber || 'PO-' + Date.now().toString().slice(-6),
      supplierOrCustomer: params.supplierName || 'Direct Inbound',
      notes: params.notes || 'Stock Inward Receipt',
      userId: params.userId || 'USR-001',
      userName: params.userName || 'System User'
    };
    Database.insert(CONFIG.SHEETS.TRANSACTIONS, txn);
    return { status: 'success', transaction: txn, newStock: newStock };
  },
  recordStockOut: function(params) {
    var product = Database.getById(CONFIG.SHEETS.PRODUCTS, params.productId);
    if (!product) throw new Error('Product not found: ' + params.productId);
    var currentStock = Number(product.currentStock) || 0;
    Validation.validateStockOut(params, currentStock);
    var qty = Number(params.quantity);
    var newStock = currentStock - qty;
    var unitPrice = params.unitPrice ? Number(params.unitPrice) : (Number(product.sellingPrice) || 0);
    var now = new Date().toISOString();
    Database.update(CONFIG.SHEETS.PRODUCTS, product.id, { currentStock: newStock, updatedAt: now });
    var txn = {
      id: this._generateTxnId(),
      date: now,
      type: 'OUT',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: -qty,
      previousStock: currentStock,
      newStock: newStock,
      unitPrice: unitPrice,
      totalValue: qty * unitPrice,
      referenceNumber: params.referenceNumber || 'SO-' + Date.now().toString().slice(-6),
      supplierOrCustomer: params.customerName || 'Direct Outbound Dispatch',
      notes: params.notes || 'Stock Outward Order',
      userId: params.userId || 'USR-001',
      userName: params.userName || 'System User'
    };
    Database.insert(CONFIG.SHEETS.TRANSACTIONS, txn);
    return { status: 'success', transaction: txn, newStock: newStock };
  },
  recordAdjustment: function(params) {
    Validation.validateAdjustment(params);
    var product = Database.getById(CONFIG.SHEETS.PRODUCTS, params.productId);
    if (!product) throw new Error('Product not found: ' + params.productId);
    var prev = Number(product.currentStock) || 0;
    var corrected = Number(params.correctedStock);
    var diff = corrected - prev;
    var now = new Date().toISOString();
    Database.update(CONFIG.SHEETS.PRODUCTS, product.id, { currentStock: corrected, updatedAt: now });
    var txn = {
      id: this._generateTxnId(),
      date: now,
      type: 'ADJUSTMENT',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: diff,
      previousStock: prev,
      newStock: corrected,
      unitPrice: Number(product.costPrice) || 0,
      totalValue: diff * (Number(product.costPrice) || 0),
      referenceNumber: params.referenceNumber || 'ADJ-' + Date.now().toString().slice(-6),
      notes: params.notes || ('Adjustment: ' + params.reason),
      userId: params.userId || 'USR-001',
      userName: params.userName || 'System User',
      reason: params.reason
    };
    Database.insert(CONFIG.SHEETS.TRANSACTIONS, txn);
    return { status: 'success', transaction: txn, adjustedStock: corrected, difference: diff };
  },
  getAllTransactions: function() { return Database.getAll(CONFIG.SHEETS.TRANSACTIONS); }
};`
  },
  {
    name: 'Validation.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'Server-side business rule validation preventing negative stocks and bad inputs.',
    content: `var Validation = {
  validateProduct: function(p) {
    if (!p.name || String(p.name).trim() === '') throw new Error('Product name is required.');
    if (!p.sku || String(p.sku).trim() === '') throw new Error('SKU is required.');
    if (p.costPrice !== undefined && Number(p.costPrice) < 0) throw new Error('Cost price must be non-negative.');
    if (p.sellingPrice !== undefined && Number(p.sellingPrice) < 0) throw new Error('Selling price must be non-negative.');
    return true;
  },
  validateStockIn: function(d) {
    if (!d.productId) throw new Error('Product is required.');
    if (!d.quantity || Number(d.quantity) <= 0) throw new Error('Quantity must be greater than zero.');
    return true;
  },
  validateStockOut: function(d, currentStock) {
    if (!d.productId) throw new Error('Product is required.');
    var qty = Number(d.quantity);
    if (!qty || qty <= 0) throw new Error('Quantity must be greater than zero.');
    if (qty > currentStock) {
      throw new Error('Insufficient stock! Available: ' + currentStock + ', Requested: ' + qty + '. Negative stock is strictly prevented.');
    }
    return true;
  },
  validateAdjustment: function(d) {
    if (!d.productId) throw new Error('Product is required.');
    if (d.correctedStock === undefined || Number(d.correctedStock) < 0) throw new Error('Corrected stock cannot be negative.');
    if (!d.reason || String(d.reason).trim() === '') throw new Error('Adjustment reason is mandatory.');
    return true;
  }
};`
  },
  {
    name: 'ReportService.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'Valuation, low-stock reorder, and KPI calculators.',
    content: `var ReportService = {
  getValuationReport: function() {
    var products = ProductService.getAllProducts();
    var totalCost = 0, totalRetail = 0, totalUnits = 0;
    var items = products.map(function(p) {
      var cost = Number(p.costPrice) || 0;
      var sell = Number(p.sellingPrice) || 0;
      var stock = Number(p.currentStock) || 0;
      var cVal = stock * cost;
      var rVal = stock * sell;
      totalUnits += stock;
      totalCost += cVal;
      totalRetail += rVal;
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        categoryName: p.categoryName,
        currentStock: stock,
        unit: p.unit,
        costPrice: cost,
        sellingPrice: sell,
        totalCostValue: cVal,
        totalRetailValue: rVal,
        marginPercent: sell > 0 ? Math.round(((sell - cost) / sell) * 1000) / 10 : 0
      };
    });
    return {
      totalUnits: totalUnits,
      totalCostValue: totalCost,
      totalRetailValue: totalRetail,
      potentialGrossProfit: totalRetail - totalCost,
      items: items
    };
  },
  getLowStockReport: function() {
    var products = ProductService.getAllProducts();
    var list = [];
    var totalEst = 0;
    products.forEach(function(p) {
      var stock = Number(p.currentStock) || 0;
      var min = Number(p.minimumStock) || 0;
      if (stock <= min) {
        var rec = Math.max(10, min * 2) - stock;
        var est = rec * (Number(p.costPrice) || 0);
        totalEst += est;
        list.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          categoryName: p.categoryName,
          currentStock: stock,
          minimumStock: min,
          unit: p.unit,
          costPrice: Number(p.costPrice) || 0,
          recommendedOrderQuantity: rec,
          estimatedReorderCost: est,
          isCritical: stock === 0
        });
      }
    });
    return { count: list.length, totalEstimatedReorderCost: totalEst, items: list };
  },
  getDashboardMetrics: function() {
    var products = ProductService.getAllProducts();
    var txns = Database.getAll(CONFIG.SHEETS.TRANSACTIONS);
    var totalUnits = 0, totalCost = 0, totalRetail = 0, low = 0, out = 0;
    products.forEach(function(p) {
      var s = Number(p.currentStock) || 0;
      var m = Number(p.minimumStock) || 0;
      totalUnits += s;
      totalCost += s * (Number(p.costPrice) || 0);
      totalRetail += s * (Number(p.sellingPrice) || 0);
      if (s === 0) out++;
      else if (s <= m) low++;
    });
    return {
      totalProducts: products.length,
      totalStockQuantity: totalUnits,
      totalCostValue: totalCost,
      totalRetailValue: totalRetail,
      potentialProfit: totalRetail - totalCost,
      lowStockCount: low,
      outOfStockCount: out,
      totalTransactions: txns.length
    };
  }
};`
  },
  {
    name: 'AuthService.gs',
    type: 'gs',
    category: 'Backend (Google Apps Script)',
    description: 'User access control and RBAC checking.',
    content: `var AuthService = {
  getUsers: function() { return Database.getAll(CONFIG.SHEETS.USERS); },
  checkPermission: function(userId, requiredRole) {
    var user = Database.getById(CONFIG.SHEETS.USERS, userId);
    if (!user) return true;
    var role = user.role || CONFIG.ROLES.STAFF;
    if (requiredRole === CONFIG.ROLES.ADMIN) return role === CONFIG.ROLES.ADMIN;
    if (requiredRole === CONFIG.ROLES.MANAGER) return role === CONFIG.ROLES.ADMIN || role === CONFIG.ROLES.MANAGER;
    return true;
  }
};`
  },
  {
    name: 'appsscript.json',
    type: 'json',
    category: 'Configuration',
    description: 'Manifest file with Google Sheets execution permissions.',
    content: `{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}`
  }
];

export const SHEET_SCHEMAS = [
  {
    tab: 'Products',
    color: 'bg-blue-50 text-blue-800',
    description: 'Master catalog of all inventoried SKUs, pricing, costs, and thresholds',
    columns: [
      { name: 'id', desc: 'Unique Product ID (e.g. PROD-001)', key: true },
      { name: 'sku', desc: 'Unique SKU identifier (e.g. SKU-ENG-101)' },
      { name: 'barcode', desc: 'Barcode / EAN-13 number' },
      { name: 'name', desc: 'Product Title / Name' },
      { name: 'categoryId', desc: 'Foreign key to Categories' },
      { name: 'categoryName', desc: 'Category display label' },
      { name: 'supplierId', desc: 'Foreign key to Suppliers' },
      { name: 'supplierName', desc: 'Supplier display label' },
      { name: 'unit', desc: 'Unit of measure (pcs, box, kg, pack)' },
      { name: 'costPrice', desc: 'Unit cost in base currency' },
      { name: 'sellingPrice', desc: 'Retail or wholesale selling price' },
      { name: 'minimumStock', desc: 'Safety stock reorder threshold' },
      { name: 'currentStock', desc: 'Live physical on-hand quantity' },
      { name: 'status', desc: 'Active, Inactive, Discontinued' },
      { name: 'location', desc: 'Warehouse aisle/rack location' },
      { name: 'description', desc: 'Detailed specifications' },
      { name: 'createdAt', desc: 'ISO creation timestamp' },
      { name: 'updatedAt', desc: 'ISO last modification timestamp' },
    ],
  },
  {
    tab: 'Categories',
    color: 'bg-emerald-50 text-emerald-800',
    description: 'Inventory departments and taxonomy classification',
    columns: [
      { name: 'id', desc: 'Category ID (e.g. CAT-001)', key: true },
      { name: 'name', desc: 'Category Name' },
      { name: 'slug', desc: 'URL safe slug identifier' },
      { name: 'description', desc: 'Scope of products included' },
      { name: 'color', desc: 'Hex badge color' },
      { name: 'status', desc: 'Active or Inactive' },
      { name: 'createdAt', desc: 'Creation timestamp' },
    ],
  },
  {
    tab: 'Suppliers',
    color: 'bg-amber-50 text-amber-800',
    description: 'Vendor directory with contact info, lead times, and payment terms',
    columns: [
      { name: 'id', desc: 'Supplier ID (e.g. SUP-001)', key: true },
      { name: 'companyName', desc: 'Supplier legal or trade name' },
      { name: 'contactPerson', desc: 'Primary sales rep or contact' },
      { name: 'email', desc: 'Email for purchase orders' },
      { name: 'phone', desc: 'Contact phone number' },
      { name: 'address', desc: 'Warehouse/dispatch address' },
      { name: 'leadTimeDays', desc: 'Expected fulfillment turnaround (days)' },
      { name: 'paymentTerms', desc: 'Net 30, COD, Net 15' },
      { name: 'status', desc: 'Active or Inactive' },
      { name: 'createdAt', desc: 'Creation timestamp' },
    ],
  },
  {
    tab: 'Transactions',
    color: 'bg-indigo-50 text-indigo-800',
    description: 'Immutable audit log of all Stock In, Stock Out, and Adjustments',
    columns: [
      { name: 'id', desc: 'Unique TXN-YYYY-XXXX number', key: true },
      { name: 'date', desc: 'ISO transaction timestamp' },
      { name: 'type', desc: 'IN, OUT, or ADJUSTMENT' },
      { name: 'productId', desc: 'Foreign key to Products' },
      { name: 'productName', desc: 'Product name snapshot' },
      { name: 'productSku', desc: 'Product SKU snapshot' },
      { name: 'quantity', desc: 'Positive for IN, negative for OUT, delta for ADJ' },
      { name: 'previousStock', desc: 'Quantity before transaction' },
      { name: 'newStock', desc: 'Quantity after transaction' },
      { name: 'unitPrice', desc: 'Cost price (IN) or Selling price (OUT)' },
      { name: 'totalValue', desc: 'Transaction financial extension' },
      { name: 'referenceNumber', desc: 'PO-xxxx, SO-xxxx, or ADJ-xxxx' },
      { name: 'supplierOrCustomer', desc: 'Origin vendor or destination client' },
      { name: 'notes', desc: 'Operational remarks' },
      { name: 'userId', desc: 'Staff member who executed operation' },
      { name: 'userName', desc: 'Staff member display name' },
      { name: 'reason', desc: 'Adjustment reason if applicable' },
    ],
  },
];
