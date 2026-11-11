/**
 * ============================================================================
 * StockFlow Inventory Management System - Validation.gs
 * Server-Side Business Rule and Input Validators
 * ============================================================================
 */

var Validation = {
  /**
   * Validates Product creation/update payload
   */
  validateProduct: function(product) {
    var errors = [];
    
    if (!product.name || String(product.name).trim() === '') {
      errors.push('Product name is required.');
    }
    if (!product.sku || String(product.sku).trim() === '') {
      errors.push('SKU is required.');
    }
    if (product.costPrice === undefined || isNaN(product.costPrice) || Number(product.costPrice) < 0) {
      errors.push('Cost price must be a non-negative number.');
    }
    if (product.sellingPrice === undefined || isNaN(product.sellingPrice) || Number(product.sellingPrice) < 0) {
      errors.push('Selling price must be a non-negative number.');
    }
    if (product.minimumStock !== undefined && (isNaN(product.minimumStock) || Number(product.minimumStock) < 0)) {
      errors.push('Minimum stock threshold must be zero or positive.');
    }
    if (product.currentStock !== undefined && (isNaN(product.currentStock) || Number(product.currentStock) < 0)) {
      errors.push('Current stock cannot be negative.');
    }
    
    if (errors.length > 0) {
      throw new Error('Validation failed: ' + errors.join(' '));
    }
    return true;
  },

  /**
   * Validates Stock In transaction
   */
  validateStockIn: function(data) {
    if (!data.productId) throw new Error('Product ID is required for Stock In.');
    if (!data.quantity || isNaN(data.quantity) || Number(data.quantity) <= 0) {
      throw new Error('Stock In quantity must be a positive number greater than zero.');
    }
    if (data.unitPrice !== undefined && (isNaN(data.unitPrice) || Number(data.unitPrice) < 0)) {
      throw new Error('Unit cost cannot be negative.');
    }
    return true;
  },

  /**
   * Validates Stock Out transaction and enforces no negative stock
   */
  validateStockOut: function(data, currentStock) {
    if (!data.productId) throw new Error('Product ID is required for Stock Out.');
    if (!data.quantity || isNaN(data.quantity) || Number(data.quantity) <= 0) {
      throw new Error('Stock Out quantity must be a positive number greater than zero.');
    }
    var requested = Number(data.quantity);
    if (requested > currentStock) {
      throw new Error(
        'Insufficient stock! Requested: ' + requested + ', Available: ' + currentStock + 
        '. Negative stock is strictly prohibited by business rules.'
      );
    }
    return true;
  },

  /**
   * Validates Stock Adjustment
   */
  validateAdjustment: function(data) {
    if (!data.productId) throw new Error('Product ID is required for adjustment.');
    if (data.correctedStock === undefined || isNaN(data.correctedStock) || Number(data.correctedStock) < 0) {
      throw new Error('Corrected stock count cannot be negative.');
    }
    if (!data.reason || String(data.reason).trim() === '') {
      throw new Error('An adjustment reason is mandatory for audit compliance.');
    }
    return true;
  }
};
