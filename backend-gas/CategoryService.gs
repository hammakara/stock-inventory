/**
 * ============================================================================
 * StockFlow Inventory Management System - CategoryService.gs
 * Category CRUD and classification logic
 * ============================================================================
 */

var CategoryService = {
  getAllCategories: function() {
    var categories = Database.getAll(CONFIG.SHEETS.CATEGORIES);
    var products = Database.getAll(CONFIG.SHEETS.PRODUCTS);
    
    // Count products per category
    var countMap = {};
    products.forEach(function(p) {
      countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1;
    });
    
    return categories.map(function(c) {
      return {
        id: c.id,
        name: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: c.description || '',
        color: c.color || '#2563EB',
        status: c.status || 'Active',
        productCount: countMap[c.id] || 0,
        createdAt: c.createdAt
      };
    });
  },

  saveCategory: function(catData) {
    if (!catData.name || String(catData.name).trim() === '') {
      throw new Error('Category name is required.');
    }
    
    var now = new Date().toISOString();
    if (catData.id && String(catData.id).trim() !== '') {
      return Database.update(CONFIG.SHEETS.CATEGORIES, catData.id, catData);
    } else {
      var all = Database.getAll(CONFIG.SHEETS.CATEGORIES);
      var nextId = 'CAT-' + ('00' + (all.length + 1)).slice(-3);
      catData.id = nextId;
      catData.slug = catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      catData.status = catData.status || 'Active';
      catData.createdAt = now;
      return Database.insert(CONFIG.SHEETS.CATEGORIES, catData);
    }
  },

  deleteCategory: function(id) {
    return Database.delete(CONFIG.SHEETS.CATEGORIES, id);
  }
};
