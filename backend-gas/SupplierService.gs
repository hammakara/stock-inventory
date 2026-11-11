/**
 * ============================================================================
 * StockFlow Inventory Management System - SupplierService.gs
 * Supplier and Vendor directory management
 * ============================================================================
 */

var SupplierService = {
  getAllSuppliers: function() {
    return Database.getAll(CONFIG.SHEETS.SUPPLIERS);
  },

  saveSupplier: function(supData) {
    if (!supData.companyName || String(supData.companyName).trim() === '') {
      throw new Error('Supplier company name is required.');
    }
    
    var now = new Date().toISOString();
    if (supData.id && String(supData.id).trim() !== '') {
      return Database.update(CONFIG.SHEETS.SUPPLIERS, supData.id, supData);
    } else {
      var all = Database.getAll(CONFIG.SHEETS.SUPPLIERS);
      var nextId = 'SUP-' + ('00' + (all.length + 1)).slice(-3);
      supData.id = nextId;
      supData.status = supData.status || 'Active';
      supData.leadTimeDays = Number(supData.leadTimeDays) || 5;
      supData.createdAt = now;
      return Database.insert(CONFIG.SHEETS.SUPPLIERS, supData);
    }
  },

  deleteSupplier: function(id) {
    return Database.delete(CONFIG.SHEETS.SUPPLIERS, id);
  }
};
