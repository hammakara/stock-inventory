/**
 * ============================================================================
 * StockFlow Inventory Management System - InventoryService.gs
 * Transaction processing for Stock In, Stock Out, Adjustments & Audit Records
 * Enforces business rules: no negative stock, atomic updates, unique TXN IDs
 * ============================================================================
 */

var InventoryService = {
  /**
   * Generates next sequential transaction ID
   */
  _generateTxnId: function() {
    var all = Database.getAll(CONFIG.SHEETS.TRANSACTIONS);
    var year = new Date().getFullYear();
    var nextNum = all.length + 1;
    return 'TXN-' + year + '-' + ('000' + nextNum).slice(-4);
  },

  /**
   * Records Stock In (Increases current stock, updates cost if provided)
   */
  recordStockIn: function(params) {
    Validation.validateStockIn(params);
    
    var product = Database.getById(CONFIG.SHEETS.PRODUCTS, params.productId);
    if (!product) throw new Error('Product not found: ' + params.productId);
    
    var qty = Number(params.quantity);
    var previousStock = Number(product.currentStock) || 0;
    var newStock = previousStock + qty;
    var unitPrice = params.unitPrice !== undefined ? Number(params.unitPrice) : (Number(product.costPrice) || 0);
    var totalValue = qty * unitPrice;
    var now = new Date().toISOString();
    
    // Update product in spreadsheet
    var updatePayload = {
      currentStock: newStock,
      updatedAt: now
    };
    if (params.unitPrice > 0) {
      updatePayload.costPrice = params.unitPrice;
    }
    Database.update(CONFIG.SHEETS.PRODUCTS, product.id, updatePayload);
    
    // Insert Transaction audit record
    var txnId = this._generateTxnId();
    var txn = {
      id: txnId,
      date: now,
      type: 'IN',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: qty,
      previousStock: previousStock,
      newStock: newStock,
      unitPrice: unitPrice,
      totalValue: totalValue,
      referenceNumber: params.referenceNumber || 'PO-' + Date.now().toString().slice(-6),
      supplierOrCustomer: params.supplierName || 'Direct Inbound',
      notes: params.notes || 'Stock Inward Receipt',
      userId: params.userId || 'USR-001',
      userName: params.userName || 'System User',
      reason: ''
    };
    Database.insert(CONFIG.SHEETS.TRANSACTIONS, txn);
    
    return {
      status: 'success',
      transaction: txn,
      newStock: newStock
    };
  },

  /**
   * Records Stock Out (Decreases stock, verifies sufficient inventory, prevents negative stock)
   */
  recordStockOut: function(params) {
    var product = Database.getById(CONFIG.SHEETS.PRODUCTS, params.productId);
    if (!product) throw new Error('Product not found: ' + params.productId);
    
    var currentStock = Number(product.currentStock) || 0;
    Validation.validateStockOut(params, currentStock);
    
    var qty = Number(params.quantity);
    var newStock = currentStock - qty;
    var unitPrice = params.unitPrice !== undefined ? Number(params.unitPrice) : (Number(product.sellingPrice) || 0);
    var totalValue = qty * unitPrice;
    var now = new Date().toISOString();
    
    Database.update(CONFIG.SHEETS.PRODUCTS, product.id, {
      currentStock: newStock,
      updatedAt: now
    });
    
    var txnId = this._generateTxnId();
    var txn = {
      id: txnId,
      date: now,
      type: 'OUT',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: -qty,
      previousStock: currentStock,
      newStock: newStock,
      unitPrice: unitPrice,
      totalValue: totalValue,
      referenceNumber: params.referenceNumber || 'SO-' + Date.now().toString().slice(-6),
      supplierOrCustomer: params.customerName || 'Direct Outbound Dispatch',
      notes: params.notes || 'Stock Outward Order',
      userId: params.userId || 'USR-001',
      userName: params.userName || 'System User',
      reason: ''
    };
    Database.insert(CONFIG.SHEETS.TRANSACTIONS, txn);
    
    return {
      status: 'success',
      transaction: txn,
      newStock: newStock
    };
  },

  /**
   * Records Stock Adjustment (Calculates difference, logs previous & new quantities)
   */
  recordAdjustment: function(params) {
    Validation.validateAdjustment(params);
    
    var product = Database.getById(CONFIG.SHEETS.PRODUCTS, params.productId);
    if (!product) throw new Error('Product not found: ' + params.productId);
    
    var previousStock = Number(product.currentStock) || 0;
    var correctedStock = Number(params.correctedStock);
    var difference = correctedStock - previousStock;
    var now = new Date().toISOString();
    
    Database.update(CONFIG.SHEETS.PRODUCTS, product.id, {
      currentStock: correctedStock,
      updatedAt: now
    });
    
    var txnId = this._generateTxnId();
    var txn = {
      id: txnId,
      date: now,
      type: 'ADJUSTMENT',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: difference,
      previousStock: previousStock,
      newStock: correctedStock,
      unitPrice: Number(product.costPrice) || 0,
      totalValue: difference * (Number(product.costPrice) || 0),
      referenceNumber: params.referenceNumber || 'ADJ-' + Date.now().toString().slice(-6),
      supplierOrCustomer: 'Audit Discrepancy',
      notes: params.notes || ('Adjustment: ' + params.reason),
      userId: params.userId || 'USR-001',
      userName: params.userName || 'System User',
      reason: params.reason
    };
    Database.insert(CONFIG.SHEETS.TRANSACTIONS, txn);
    
    // Also record to Adjustments specific log sheet
    var adjRecord = {
      id: 'ADJR-' + Date.now().toString().slice(-6),
      date: now,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      previousStock: previousStock,
      adjustedStock: correctedStock,
      difference: difference,
      reason: params.reason,
      referenceNumber: txn.referenceNumber,
      notes: params.notes || '',
      userId: params.userId || 'USR-001',
      userName: params.userName || 'System User'
    };
    Database.insert(CONFIG.SHEETS.ADJUSTMENTS, adjRecord);
    
    return {
      status: 'success',
      transaction: txn,
      adjustedStock: correctedStock,
      difference: difference
    };
  },

  /**
   * Retrieves all transaction audit history
   */
  getAllTransactions: function() {
    return Database.getAll(CONFIG.SHEETS.TRANSACTIONS);
  }
};
