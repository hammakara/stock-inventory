import {
  Product,
  Category,
  Supplier,
  Customer,
  StockTransaction,
  User,
  AppSettings,
  DashboardMetrics,
} from '../types/inventory';
import {
  initialProducts,
  initialCategories,
  initialSuppliers,
  initialCustomers,
  initialTransactions,
  initialUsers,
  initialSettings,
} from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'stockflow_products_v1',
  CATEGORIES: 'stockflow_categories_v1',
  SUPPLIERS: 'stockflow_suppliers_v1',
  CUSTOMERS: 'stockflow_customers_v1',
  TRANSACTIONS: 'stockflow_transactions_v1',
  USERS: 'stockflow_users_v1',
  SETTINGS: 'stockflow_settings_v1',
  CURRENT_USER: 'stockflow_current_user_v1',
};

class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch (err) {
      console.warn(`Failed to read ${key} from storage:`, err);
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to write ${key} to storage:`, err);
    }
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    const list = this.get<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const categories = this.getCategories();
    const suppliers = this.getSuppliers();
    
    // Enrich with current category and supplier names if needed
    return list.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const sup = suppliers.find((s) => s.id === p.supplierId);
      return {
        ...p,
        categoryName: cat ? cat.name : p.categoryName || 'Unassigned',
        supplierName: sup ? sup.companyName : p.supplierName || 'Unassigned',
      };
    });
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  saveProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Product {
    const products = this.getProducts();
    const now = new Date().toISOString();

    if (product.id) {
      // Update existing
      const index = products.findIndex((p) => p.id === product.id);
      if (index === -1) throw new Error('Product not found for update');
      const updated: Product = {
        ...products[index],
        ...product,
        id: product.id,
        updatedAt: now,
      };
      products[index] = updated;
      this.set(STORAGE_KEYS.PRODUCTS, products);
      return updated;
    } else {
      // Generate unique product ID
      const count = products.length + 1;
      const id = `PROD-${String(count).padStart(3, '0')}`;
      const newProduct: Product = {
        ...product,
        id,
        createdAt: now,
        updatedAt: now,
      };
      products.unshift(newProduct);
      this.set(STORAGE_KEYS.PRODUCTS, products);
      return newProduct;
    }
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      this.set(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    const categories = this.get<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const products = this.get<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    
    // Calculate live product counts
    return categories.map((cat) => ({
      ...cat,
      productCount: products.filter((p) => p.categoryId === cat.id).length,
    }));
  }

  saveCategory(category: Omit<Category, 'id' | 'createdAt'> & { id?: string }): Category {
    const categories = this.getCategories();
    const now = new Date().toISOString();

    if (category.id) {
      const idx = categories.findIndex((c) => c.id === category.id);
      if (idx === -1) throw new Error('Category not found');
      const updated: Category = {
        ...categories[idx],
        ...category,
        id: category.id,
      };
      categories[idx] = updated;
      this.set(STORAGE_KEYS.CATEGORIES, categories);
      return updated;
    } else {
      const id = `CAT-${String(categories.length + 1).padStart(3, '0')}`;
      const newCat: Category = {
        ...category,
        id,
        slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: now,
      };
      categories.push(newCat);
      this.set(STORAGE_KEYS.CATEGORIES, categories);
      return newCat;
    }
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length !== categories.length) {
      this.set(STORAGE_KEYS.CATEGORIES, filtered);
      return true;
    }
    return false;
  }

  // --- SUPPLIERS ---
  getSuppliers(): Supplier[] {
    return this.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  }

  saveSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'> & { id?: string }): Supplier {
    const suppliers = this.getSuppliers();
    const now = new Date().toISOString();

    if (supplier.id) {
      const idx = suppliers.findIndex((s) => s.id === supplier.id);
      if (idx === -1) throw new Error('Supplier not found');
      const updated: Supplier = {
        ...suppliers[idx],
        ...supplier,
        id: supplier.id,
      };
      suppliers[idx] = updated;
      this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
      return updated;
    } else {
      const id = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
      const newSup: Supplier = {
        ...supplier,
        id,
        createdAt: now,
      };
      suppliers.push(newSup);
      this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
      return newSup;
    }
  }

  deleteSupplier(id: string): boolean {
    const suppliers = this.getSuppliers();
    const filtered = suppliers.filter((s) => s.id !== id);
    if (filtered.length !== suppliers.length) {
      this.set(STORAGE_KEYS.SUPPLIERS, filtered);
      return true;
    }
    return false;
  }

  // --- CUSTOMERS ---
  getCustomers(): Customer[] {
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  }

  saveCustomer(customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string }): Customer {
    const customers = this.getCustomers();
    const now = new Date().toISOString();

    if (customer.id) {
      const idx = customers.findIndex((c) => c.id === customer.id);
      if (idx === -1) throw new Error('Customer not found');
      const updated: Customer = {
        ...customers[idx],
        ...customer,
        id: customer.id,
      };
      customers[idx] = updated;
      this.set(STORAGE_KEYS.CUSTOMERS, customers);
      return updated;
    } else {
      const id = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
      const newCust: Customer = {
        ...customer,
        id,
        totalOrders: 0,
        createdAt: now,
      };
      customers.push(newCust);
      this.set(STORAGE_KEYS.CUSTOMERS, customers);
      return newCust;
    }
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers();
    const filtered = customers.filter((c) => c.id !== id);
    if (filtered.length !== customers.length) {
      this.set(STORAGE_KEYS.CUSTOMERS, filtered);
      return true;
    }
    return false;
  }

  // --- TRANSACTIONS & STOCK OPERATIONS ---
  getTransactions(): StockTransaction[] {
    return this.get<StockTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  }

  // Business Rule: Stock In increases current stock, creates transaction
  executeStockIn(data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    referenceNumber: string;
    supplierId?: string;
    notes?: string;
    userId: string;
    userName: string;
  }): { product: Product; transaction: StockTransaction } {
    if (data.quantity <= 0) {
      throw new Error('Stock in quantity must be greater than zero.');
    }

    const products = this.getProducts();
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      throw new Error('Selected product does not exist.');
    }

    const previousStock = product.currentStock;
    const newStock = previousStock + Number(data.quantity);
    const now = new Date().toISOString();

    // Update product stock and optionally unit cost
    product.currentStock = newStock;
    if (data.unitPrice > 0) {
      product.costPrice = data.unitPrice;
    }
    product.updatedAt = now;
    this.set(STORAGE_KEYS.PRODUCTS, products);

    // Create Transaction Record
    const transactions = this.getTransactions();
    const count = transactions.length + 1;
    const year = new Date().getFullYear();
    const txnId = `TXN-${year}-${String(count).padStart(4, '0')}`;

    const suppliers = this.getSuppliers();
    const supplier = suppliers.find((s) => s.id === data.supplierId);

    const transaction: StockTransaction = {
      id: txnId,
      date: now,
      type: 'IN',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: Number(data.quantity),
      previousStock,
      newStock,
      unitPrice: data.unitPrice || product.costPrice,
      totalValue: Number(data.quantity) * (data.unitPrice || product.costPrice),
      referenceNumber: data.referenceNumber || `PO-${Date.now().toString().slice(-6)}`,
      supplierOrCustomer: supplier ? supplier.companyName : 'Direct Inbound',
      notes: data.notes || 'Stock Inward Receipt',
      userId: data.userId,
      userName: data.userName,
    };

    transactions.unshift(transaction);
    this.set(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { product, transaction };
  }

  // Business Rule: Stock Out decreases current stock, prevents negative stock, creates transaction
  executeStockOut(data: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    referenceNumber: string;
    customerId?: string;
    notes?: string;
    userId: string;
    userName: string;
  }): { product: Product; transaction: StockTransaction } {
    if (data.quantity <= 0) {
      throw new Error('Stock out quantity must be greater than zero.');
    }

    const products = this.getProducts();
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      throw new Error('Selected product does not exist.');
    }

    if (product.currentStock < data.quantity) {
      throw new Error(
        `Insufficient stock! Requested: ${data.quantity} ${product.unit}, Available: ${product.currentStock} ${product.unit}. Negative stock is strictly prevented.`
      );
    }

    const previousStock = product.currentStock;
    const newStock = previousStock - Number(data.quantity);
    const now = new Date().toISOString();

    // Update product stock
    product.currentStock = newStock;
    product.updatedAt = now;
    this.set(STORAGE_KEYS.PRODUCTS, products);

    // Create Transaction Record
    const transactions = this.getTransactions();
    const count = transactions.length + 1;
    const year = new Date().getFullYear();
    const txnId = `TXN-${year}-${String(count).padStart(4, '0')}`;

    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === data.customerId);

    const unitPrice = data.unitPrice ?? product.sellingPrice;
    const transaction: StockTransaction = {
      id: txnId,
      date: now,
      type: 'OUT',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: -Number(data.quantity),
      previousStock,
      newStock,
      unitPrice,
      totalValue: Number(data.quantity) * unitPrice,
      referenceNumber: data.referenceNumber || `SO-${Date.now().toString().slice(-6)}`,
      supplierOrCustomer: customer ? customer.company : 'Direct Outbound Dispatch',
      notes: data.notes || 'Stock Outward Order',
      userId: data.userId,
      userName: data.userName,
    };

    transactions.unshift(transaction);
    this.set(STORAGE_KEYS.TRANSACTIONS, transactions);

    // If customer selected, update order count
    if (customer) {
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      this.set(STORAGE_KEYS.CUSTOMERS, customers);
    }

    return { product, transaction };
  }

  // Business Rule: Stock Adjustment records difference, previous and new quantities, creates audit entry
  executeStockAdjustment(data: {
    productId: string;
    correctedStock: number;
    reason: string;
    notes?: string;
    userId: string;
    userName: string;
    referenceNumber?: string;
  }): { product: Product; transaction: StockTransaction } {
    if (data.correctedStock < 0) {
      throw new Error('Adjusted stock quantity cannot be negative.');
    }

    const products = this.getProducts();
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      throw new Error('Selected product does not exist.');
    }

    const previousStock = product.currentStock;
    const newStock = Number(data.correctedStock);
    const diff = newStock - previousStock;
    const now = new Date().toISOString();

    product.currentStock = newStock;
    product.updatedAt = now;
    this.set(STORAGE_KEYS.PRODUCTS, products);

    const transactions = this.getTransactions();
    const count = transactions.length + 1;
    const year = new Date().getFullYear();
    const txnId = `TXN-${year}-${String(count).padStart(4, '0')}`;

    const transaction: StockTransaction = {
      id: txnId,
      date: now,
      type: 'ADJUSTMENT',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: diff,
      previousStock,
      newStock,
      unitPrice: product.costPrice,
      totalValue: diff * product.costPrice,
      referenceNumber: data.referenceNumber || `ADJ-${Date.now().toString().slice(-6)}`,
      notes: data.notes || `Stock audit adjustment: ${data.reason}`,
      reason: data.reason,
      userId: data.userId,
      userName: data.userName,
    };

    transactions.unshift(transaction);
    this.set(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { product, transaction };
  }

  // --- USERS & AUTH ---
  getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  getCurrentUser(): User {
    return this.get<User>(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
  }

  setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  saveUser(user: Omit<User, 'id'> & { id?: string }): User {
    const users = this.getUsers();
    if (user.id) {
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) throw new Error('User not found');
      const updated = { ...users[idx], ...user };
      users[idx] = updated;
      this.set(STORAGE_KEYS.USERS, users);
      return updated;
    } else {
      const id = `USR-${String(users.length + 1).padStart(3, '0')}`;
      const newUser: User = { ...user, id };
      users.push(newUser);
      this.set(STORAGE_KEYS.USERS, users);
      return newUser;
    }
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length !== users.length) {
      this.set(STORAGE_KEYS.USERS, filtered);
      return true;
    }
    return false;
  }

  // --- SETTINGS ---
  getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
  }

  saveSettings(settings: AppSettings): AppSettings {
    this.set(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  }

  // --- METRICS ---
  getDashboardMetrics(): DashboardMetrics {
    const products = this.getProducts();
    const suppliers = this.getSuppliers();
    const categories = this.getCategories();
    const transactions = this.getTransactions();

    const totalProducts = products.length;
    let totalStockQuantity = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalStockQuantity += p.currentStock;
      totalCostValue += p.currentStock * p.costPrice;
      totalRetailValue += p.currentStock * p.sellingPrice;

      if (p.currentStock === 0) {
        outOfStockCount++;
      } else if (p.currentStock <= p.minimumStock) {
        lowStockCount++;
      }
    });

    const potentialProfit = Math.max(0, totalRetailValue - totalCostValue);

    // Calculate today's activity
    const today = new Date().toISOString().split('T')[0];
    const todayTxns = transactions.filter((t) => t.date.startsWith(today));
    
    let todayInboundValue = 0;
    let todayOutboundValue = 0;

    todayTxns.forEach((t) => {
      if (t.type === 'IN') {
        todayInboundValue += Math.abs(t.totalValue);
      } else if (t.type === 'OUT') {
        todayOutboundValue += Math.abs(t.totalValue);
      }
    });

    return {
      totalProducts,
      totalStockQuantity,
      totalCostValue,
      totalRetailValue,
      potentialProfit,
      lowStockCount,
      outOfStockCount,
      totalSuppliers: suppliers.length,
      totalCategories: categories.length,
      todayTransactionsCount: todayTxns.length,
      todayInboundValue,
      todayOutboundValue,
    };
  }

  // Reset to default dataset
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }

  // Export full system database to JSON
  exportDatabaseToJson(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      suppliers: this.getSuppliers(),
      customers: this.getCustomers(),
      transactions: this.getTransactions(),
      users: this.getUsers(),
      settings: this.getSettings(),
    };
    return JSON.stringify(payload, null, 2);
  }

  // Test live connection to Google Apps Script Web App URL
  async testGoogleAppsScriptConnection(url: string): Promise<{ success: boolean; message: string; details?: any }> {
    if (!url || !url.trim().startsWith('http')) {
      return {
        success: false,
        message: 'Invalid Web App URL. Please provide a valid deployed Google Apps Script URL (https://script.google.com/macros/s/.../exec).',
      };
    }

    try {
      // Apps Script Web App responses can be checked with action=ping
      const pingUrl = `${url.trim()}${url.includes('?') ? '&' : '?'}action=ping`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      const json = await response.json();
      if (json && (json.status === 'success' || json.message || json.version)) {
        return {
          success: true,
          message: `Connected successfully! Google Apps Script responded: ${json.message || 'Ready'} (Spreadsheet: ${json.spreadsheetTitle || 'Connected'})`,
          details: json,
        };
      }
      return {
        success: true,
        message: 'Endpoint responded successfully. Ready for bidirectional Sheets synchronization.',
        details: json,
      };
    } catch (err: any) {
      // CORS or network error explanation
      return {
        success: false,
        message: `Connection check failed: ${err.message || 'CORS or network error'}. Make sure your Apps Script Web App is deployed with: "Execute as: Me" and "Who has access: Anyone".`,
      };
    }
  }

  // Push full database snapshot to Google Apps Script
  async syncToGoogleSheets(url: string): Promise<{ success: boolean; message: string }> {
    if (!url || !url.trim().startsWith('http')) {
      return { success: false, message: 'Google Apps Script Web App URL is not configured.' };
    }

    try {
      const payload = {
        action: 'bulkSync',
        data: {
          products: this.getProducts(),
          categories: this.getCategories(),
          suppliers: this.getSuppliers(),
          customers: this.getCustomers(),
          transactions: this.getTransactions(),
        },
      };

      const res = await fetch(url.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Using text/plain avoids CORS preflight triggers in Google Apps Script
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (resJson && resJson.status === 'success') {
        const settings = this.getSettings();
        settings.lastSyncTime = new Date().toLocaleString();
        this.saveSettings(settings);
        return { success: true, message: 'Successfully synced all records to Google Sheets!' };
      }
      return { success: true, message: 'Sync request transmitted to Google Apps Script.' };
    } catch (err: any) {
      return {
        success: false,
        message: `Sync failed: ${err.message}. Verify that the Google Apps Script Web App has doPost() handling and is set to "Anyone".`,
      };
    }
  }
}

export const storage = new StorageService();
