/**
 * Core Domain Types for Enterprise Inventory Management System
 */

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type ProductStatus = 'Active' | 'Inactive' | 'Discontinued';

export interface Product {
  id: string; // e.g. PROD-001
  sku: string; // e.g. SKU-TECH-001
  barcode: string; // e.g. 8901234567890
  name: string;
  categoryId: string;
  categoryName?: string;
  supplierId: string;
  supplierName?: string;
  unit: string; // pcs, boxes, kg, meters, packs, liters
  costPrice: number;
  sellingPrice: number;
  minimumStock: number;
  currentStock: number;
  status: ProductStatus;
  description?: string;
  location?: string; // Warehouse Bin/Shelf e.g. A-12-3
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string; // CAT-001
  name: string;
  description: string;
  slug: string;
  color: string;
  status: 'Active' | 'Inactive';
  productCount?: number;
  createdAt: string;
}

export interface Supplier {
  id: string; // SUP-001
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  paymentTerms: string; // e.g. Net 30, COD
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Customer {
  id: string; // CUST-001
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  totalOrders?: number;
  createdAt: string;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockTransaction {
  id: string; // TXN-0001
  date: string; // ISO string
  type: TransactionType;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number; // positive for IN, negative for OUT, delta for ADJUSTMENT
  previousStock: number;
  newStock: number;
  unitPrice: number;
  totalValue: number;
  referenceNumber: string; // PO-xxxx, SO-xxxx, ADJ-xxxx
  supplierOrCustomer?: string;
  notes: string;
  userId: string;
  userName: string;
  reason?: string; // Reason code for adjustments
}

export interface StockAdjustmentRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  productSku: string;
  previousStock: number;
  adjustedStock: number;
  difference: number;
  reason: string; // 'Damaged', 'Loss/Theft', 'Cycle Count Correction', 'Return', 'Expired', 'Other'
  referenceNumber: string;
  notes: string;
  userId: string;
  userName: string;
}

export type UserRole = 'Admin' | 'Inventory Manager' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  avatar?: string;
}

export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  currency: string;
  currencySymbol: string;
  lowStockThresholdDefault: number;
  taxRatePercent: number;
  googleSheetsId: string;
  googleAppsScriptUrl: string;
  syncMode: 'local' | 'live_sheets';
  autoSync: boolean;
  lastSyncTime?: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalStockQuantity: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSuppliers: number;
  totalCategories: number;
  todayTransactionsCount: number;
  todayInboundValue: number;
  todayOutboundValue: number;
}
