/**
 * ============================================================================
 * StockFlow Inventory Management System - Code.gs
 * Main entry point for Google Apps Script (HTML Service & Web App API)
 * ============================================================================
 */

/**
 * Serves the HTML frontend when deployed as an Apps Script Web App
 */
function doGet(e) {
  // If an API action query parameter is provided, respond as JSON
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }
  
  // Otherwise render the HTML application
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle(CONFIG.APP_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handles incoming POST requests (Webhooks / External App Sync)
 */
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

/**
 * Helper to include HTML partials (css.html, javascript.html, etc.)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Handles GET API requests
 */
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

/**
 * Central action dispatcher for both Web API and google.script.run
 */
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
      
    // Products
    case 'getProducts':
      return ProductService.getAllProducts();
    case 'saveProduct':
      return ProductService.saveProduct(data);
    case 'deleteProduct':
      return ProductService.deleteProduct(data.id);
      
    // Categories
    case 'getCategories':
      return CategoryService.getAllCategories();
    case 'saveCategory':
      return CategoryService.saveCategory(data);
    case 'deleteCategory':
      return CategoryService.deleteCategory(data.id);
      
    // Suppliers
    case 'getSuppliers':
      return SupplierService.getAllSuppliers();
    case 'saveSupplier':
      return SupplierService.saveSupplier(data);
    case 'deleteSupplier':
      return SupplierService.deleteSupplier(data.id);
      
    // Inventory Operations
    case 'stockIn':
      return InventoryService.recordStockIn(data);
    case 'stockOut':
      return InventoryService.recordStockOut(data);
    case 'stockAdjustment':
      return InventoryService.recordAdjustment(data);
    case 'getTransactions':
      return InventoryService.getAllTransactions();
      
    // Reports
    case 'getValuationReport':
      return ReportService.getValuationReport();
    case 'getLowStockReport':
      return ReportService.getLowStockReport();
    case 'getDashboardMetrics':
      return ReportService.getDashboardMetrics();
      
    // Bulk Sync from web client
    case 'bulkSync':
      return handleBulkSync(data);
      
    default:
      throw new Error('Unknown action: ' + action);
  }
}

/**
 * Synchronizes client data snapshot to Google Sheets
 */
function handleBulkSync(data) {
  Database.initializeDatabase();
  
  if (data.products && Array.isArray(data.products)) {
    data.products.forEach(function(p) {
      try {
        var existing = Database.getById(CONFIG.SHEETS.PRODUCTS, p.id);
        if (existing) Database.update(CONFIG.SHEETS.PRODUCTS, p.id, p);
        else Database.insert(CONFIG.SHEETS.PRODUCTS, p);
      } catch (e) {}
    });
  }
  
  if (data.transactions && Array.isArray(data.transactions)) {
    data.transactions.forEach(function(t) {
      try {
        var existing = Database.getById(CONFIG.SHEETS.TRANSACTIONS, t.id);
        if (!existing) Database.insert(CONFIG.SHEETS.TRANSACTIONS, t);
      } catch (e) {}
    });
  }
  
  return { message: 'Synchronization completed successfully', syncedAt: new Date().toISOString() };
}

// ----------------------------------------------------------------------------
// Client-side wrappers for google.script.run
// ----------------------------------------------------------------------------
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
function apiGetLowStockReport() { return processAction('getLowStockReport', {}); }
