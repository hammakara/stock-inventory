/**
 * ============================================================================
 * StockFlow Inventory Management System - Config.gs
 * Configuration parameters, Sheet names, and System Constants
 * ============================================================================
 */

var CONFIG = {
  // Replace with your Google Spreadsheet ID or leave blank to bind to Active Spreadsheet
  SPREADSHEET_ID: '', // e.g. '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  
  APP_TITLE: 'StockFlow - Inventory Management System',
  VERSION: '1.0.0',
  CURRENCY_SYMBOL: '$',
  
  // Sheet tab names
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
  
  // Column definitions for automatic schema creation
  SCHEMAS: {
    Products: [
      'id', 'sku', 'barcode', 'name', 'categoryId', 'categoryName',
      'supplierId', 'supplierName', 'unit', 'costPrice', 'sellingPrice',
      'minimumStock', 'currentStock', 'status', 'location', 'description',
      'createdAt', 'updatedAt'
    ],
    Categories: [
      'id', 'name', 'slug', 'description', 'color', 'status', 'createdAt'
    ],
    Suppliers: [
      'id', 'companyName', 'contactPerson', 'email', 'phone', 'address',
      'leadTimeDays', 'paymentTerms', 'status', 'createdAt'
    ],
    Customers: [
      'id', 'name', 'company', 'email', 'phone', 'address',
      'status', 'totalOrders', 'createdAt'
    ],
    Transactions: [
      'id', 'date', 'type', 'productId', 'productName', 'productSku',
      'quantity', 'previousStock', 'newStock', 'unitPrice', 'totalValue',
      'referenceNumber', 'supplierOrCustomer', 'notes', 'userId', 'userName', 'reason'
    ],
    Adjustments: [
      'id', 'date', 'productId', 'productName', 'productSku',
      'previousStock', 'adjustedStock', 'difference', 'reason',
      'referenceNumber', 'notes', 'userId', 'userName'
    ],
    Users: [
      'id', 'name', 'email', 'role', 'status', 'lastLogin'
    ],
    Settings: [
      'key', 'value', 'updatedAt'
    ]
  },
  
  // User Roles
  ROLES: {
    ADMIN: 'Admin',
    MANAGER: 'Inventory Manager',
    STAFF: 'Staff'
  }
};
