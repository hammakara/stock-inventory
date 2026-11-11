/**
 * ============================================================================
 * StockFlow Inventory Management System - ProductService.gs
 * Product Catalog Management, SKU generator, and stock level checks
 * ============================================================================
 */

var ProductService = {
  /**
   * Retrieves all products enriched with Category and Supplier names
   */
  getAllProducts: function() {
    var products = Database.getAll(CONFIG.SHEETS.PRODUCTS);
    var categories = Database.getAll(CONFIG.SHEETS.CATEGORIES);
    var suppliers = Database.getAll(CONFIG.SHEETS.SUPPLIERS);
    
    var catMap = {};
    categories.forEach(function(c) { catMap[c.id] = c.name; });
    
    var supMap = {};
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

  /**
   * Gets a single product by ID
   */
  getProductById: function(id) {
    var p = Database.getById(CONFIG.SHEETS.PRODUCTS, id);
    if (!p) return null;
    return p;
  },

  /**
   * Creates or updates a product
   */
  saveProduct: function(productData) {
    Validation.validateProduct(productData);
    var now = new Date().toISOString();
    
    if (productData.id && String(productData.id).trim() !== '') {
      // Update
      productData.updatedAt = now;
      return Database.update(CONFIG.SHEETS.PRODUCTS, productData.id, productData);
    } else {
      // Create new with unique ID
      var all = Database.getAll(CONFIG.SHEETS.PRODUCTS);
      var nextIdNum = all.length + 1;
      var newId = 'PROD-' + ('00' + nextIdNum).slice(-3);
      
      productData.id = newId;
      productData.currentStock = Number(productData.currentStock) || 0;
      productData.status = productData.status || 'Active';
      productData.createdAt = now;
      productData.updatedAt = now;
      
      return Database.insert(CONFIG.SHEETS.PRODUCTS, productData);
    }
  },

  /**
   * Deletes a product by ID
   */
  deleteProduct: function(id) {
    return Database.delete(CONFIG.SHEETS.PRODUCTS, id);
  }
};
