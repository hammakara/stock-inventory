/**
 * ============================================================================
 * StockFlow Inventory Management System - ReportService.gs
 * Inventory Valuation, Low-Stock Reordering, and Movement Analytics
 * ============================================================================
 */

var ReportService = {
  /**
   * Generates valuation report across all catalog items
   */
  getValuationReport: function() {
    var products = ProductService.getAllProducts();
    var totalCostValue = 0;
    var totalRetailValue = 0;
    var totalUnits = 0;
    
    var items = products.map(function(p) {
      var cost = Number(p.costPrice) || 0;
      var sell = Number(p.sellingPrice) || 0;
      var stock = Number(p.currentStock) || 0;
      var itemCostValue = stock * cost;
      var itemRetailValue = stock * sell;
      var margin = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
      
      totalUnits += stock;
      totalCostValue += itemCostValue;
      totalRetailValue += itemRetailValue;
      
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        categoryName: p.categoryName,
        currentStock: stock,
        unit: p.unit,
        costPrice: cost,
        sellingPrice: sell,
        totalCostValue: itemCostValue,
        totalRetailValue: itemRetailValue,
        potentialProfit: itemRetailValue - itemCostValue,
        marginPercent: Math.round(margin * 10) / 10
      };
    });
    
    return {
      totalUnits: totalUnits,
      totalCostValue: totalCostValue,
      totalRetailValue: totalRetailValue,
      potentialGrossProfit: totalRetailValue - totalCostValue,
      overallMarginPercent: totalRetailValue > 0 ? Math.round(((totalRetailValue - totalCostValue) / totalRetailValue) * 1000) / 10 : 0,
      items: items
    };
  },

  /**
   * Generates low stock reorder advisory list
   */
  getLowStockReport: function() {
    var products = ProductService.getAllProducts();
    var lowStockItems = [];
    var totalEstimatedReorderCost = 0;
    
    products.forEach(function(p) {
      var stock = Number(p.currentStock) || 0;
      var min = Number(p.minimumStock) || 0;
      
      if (stock <= min) {
        var deficit = min - stock;
        var recommendedOrder = deficit > 0 ? (deficit + Math.max(10, min)) : Math.max(10, min);
        var estCost = recommendedOrder * (Number(p.costPrice) || 0);
        totalEstimatedReorderCost += estCost;
        
        lowStockItems.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          categoryName: p.categoryName,
          supplierName: p.supplierName,
          currentStock: stock,
          minimumStock: min,
          unit: p.unit,
          costPrice: Number(p.costPrice) || 0,
          recommendedOrderQuantity: recommendedOrder,
          estimatedReorderCost: estCost,
          isCritical: stock === 0
        });
      }
    });
    
    return {
      count: lowStockItems.length,
      totalEstimatedReorderCost: totalEstimatedReorderCost,
      items: lowStockItems
    };
  },

  /**
   * Generates high-level dashboard metrics
   */
  getDashboardMetrics: function() {
    var products = ProductService.getAllProducts();
    var txns = Database.getAll(CONFIG.SHEETS.TRANSACTIONS);
    var suppliers = Database.getAll(CONFIG.SHEETS.SUPPLIERS);
    var categories = Database.getAll(CONFIG.SHEETS.CATEGORIES);
    
    var totalUnits = 0;
    var totalCostVal = 0;
    var totalRetailVal = 0;
    var lowCount = 0;
    var outCount = 0;
    
    products.forEach(function(p) {
      var stock = Number(p.currentStock) || 0;
      var min = Number(p.minimumStock) || 0;
      var cost = Number(p.costPrice) || 0;
      var sell = Number(p.sellingPrice) || 0;
      
      totalUnits += stock;
      totalCostVal += stock * cost;
      totalRetailVal += stock * sell;
      
      if (stock === 0) outCount++;
      else if (stock <= min) lowCount++;
    });
    
    return {
      totalProducts: products.length,
      totalStockQuantity: totalUnits,
      totalCostValue: totalCostVal,
      totalRetailValue: totalRetailVal,
      potentialProfit: totalRetailVal - totalCostVal,
      lowStockCount: lowCount,
      outOfStockCount: outCount,
      totalSuppliers: suppliers.length,
      totalCategories: categories.length,
      totalTransactions: txns.length
    };
  }
};
