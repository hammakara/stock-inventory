import React, { useState, useEffect, useCallback } from 'react';
import { storage } from './services/storage';
import {
  Product,
  Category,
  Supplier,
  Customer,
  StockTransaction,
  User,
  AppSettings,
  DashboardMetrics,
} from './types/inventory';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { CustomersView } from './components/customers/CustomersView';
import { StockInView } from './components/inventory/StockInView';
import { StockOutView } from './components/inventory/StockOutView';
import { StockAdjustmentView } from './components/inventory/StockAdjustmentView';
import { MovementHistoryView } from './components/inventory/MovementHistoryView';
import { ReportsView } from './components/reports/ReportsView';
import { GoogleAppsScriptHub } from './components/gas-hub/GoogleAppsScriptHub';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { QuickMovementModal } from './components/common/QuickMovementModal';

function InventoryApp() {
  const { showToast } = useToast();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQuickMoveOpen, setIsQuickMoveOpen] = useState(false);
  const [preselectedProductId, setPreselectedProductId] = useState<string | undefined>(undefined);

  // Core Datasets
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [metrics, setMetrics] = useState<DashboardMetrics>(storage.getDashboardMetrics());

  // Reload all data from local storage engine
  const refreshState = useCallback(() => {
    const prods = storage.getProducts();
    const cats = storage.getCategories();
    const sups = storage.getSuppliers();
    const custs = storage.getCustomers();
    const txns = storage.getTransactions();
    const usrs = storage.getUsers();
    const curUsr = storage.getCurrentUser();
    const setts = storage.getSettings();
    const mets = storage.getDashboardMetrics();

    setProducts(prods);
    setCategories(cats);
    setSuppliers(sups);
    setCustomers(custs);
    setTransactions(txns);
    setUsers(usrs);
    setCurrentUser(curUsr);
    setSettings(setts);
    setMetrics(mets);
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Product Operations
  const handleSaveProduct = (productData: any) => {
    try {
      const saved = storage.saveProduct(productData);
      refreshState();
      showToast(`Product "${saved.name}" (${saved.sku}) saved successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = (id: string) => {
    const success = storage.deleteProduct(id);
    if (success) {
      refreshState();
      showToast('Product removed from catalog.', 'info');
    }
  };

  // Category Operations
  const handleSaveCategory = (catData: any) => {
    try {
      const saved = storage.saveCategory(catData);
      refreshState();
      showToast(`Category "${saved.name}" saved!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = (id: string) => {
    const success = storage.deleteCategory(id);
    if (success) {
      refreshState();
      showToast('Category deleted.', 'info');
    }
  };

  // Supplier Operations
  const handleSaveSupplier = (supData: any) => {
    try {
      const saved = storage.saveSupplier(supData);
      refreshState();
      showToast(`Supplier "${saved.companyName}" saved!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSupplier = (id: string) => {
    const success = storage.deleteSupplier(id);
    if (success) {
      refreshState();
      showToast('Supplier deleted.', 'info');
    }
  };

  // Customer Operations
  const handleSaveCustomer = (custData: any) => {
    try {
      const saved = storage.saveCustomer(custData);
      refreshState();
      showToast(`Customer "${saved.company}" saved!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCustomer = (id: string) => {
    const success = storage.deleteCustomer(id);
    if (success) {
      refreshState();
      showToast('Customer deleted.', 'info');
    }
  };

  // Inventory: Stock In
  const handleStockIn = (data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    referenceNumber: string;
    supplierId?: string;
    notes?: string;
  }) => {
    try {
      const res = storage.executeStockIn({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      refreshState();
      showToast(
        `Stock In recorded! Added ${data.quantity} units of ${res.product.name}. New balance: ${res.transaction.newStock} ${res.product.unit}`,
        'success'
      );
      setActiveTab('movements');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Inventory: Stock Out
  const handleStockOut = (data: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    referenceNumber: string;
    customerId?: string;
    notes?: string;
  }) => {
    try {
      const res = storage.executeStockOut({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      refreshState();
      showToast(
        `Stock Out confirmed! Dispatched ${data.quantity} units. Remaining balance: ${res.transaction.newStock} ${res.product.unit}`,
        'success'
      );
      setActiveTab('movements');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Inventory: Stock Adjustment
  const handleStockAdjustment = (data: {
    productId: string;
    correctedStock: number;
    reason: string;
    notes?: string;
    referenceNumber?: string;
  }) => {
    try {
      const res = storage.executeStockAdjustment({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      refreshState();
      const delta = res.transaction.quantity;
      showToast(
        `Physical inventory reconciled! Stock adjusted to ${res.transaction.newStock} ${res.product.unit} (Variance: ${delta > 0 ? `+${delta}` : delta})`,
        'success'
      );
      setActiveTab('movements');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // User Operations & Simulation
  const handleSaveUser = (userData: any) => {
    try {
      const saved = storage.saveUser(userData);
      refreshState();
      showToast(`User account "${saved.name}" saved!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = (id: string) => {
    const success = storage.deleteUser(id);
    if (success) {
      refreshState();
      showToast('User account removed.', 'info');
    }
  };

  const handleSwitchUser = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    showToast(`Switched active session to: ${user.name} (${user.role})`, 'info');
  };

  // Settings & Maintenance
  const handleSaveSettings = (newSettings: AppSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    refreshState();
  };

  const handleResetDatabase = () => {
    storage.resetToDefaults();
    refreshState();
    showToast('Database reset to default seed catalog & transaction records.', 'success');
  };

  const handleExportJson = () => {
    const jsonStr = storage.exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stockflow-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database exported to JSON file.', 'success');
  };

  // Navigation Helpers
  const startStockInWithProduct = (productId?: string) => {
    setPreselectedProductId(productId);
    setActiveTab('stock-in');
  };

  const startStockOutWithProduct = (productId?: string) => {
    setPreselectedProductId(productId);
    setActiveTab('stock-out');
  };

  const startAdjustmentWithProduct = (productId?: string) => {
    setPreselectedProductId(productId);
    setActiveTab('adjustment');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lowStockCount={metrics.lowStockCount}
        currentUser={currentUser}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          allUsers={users}
          onOpenQuickMove={() => setIsQuickMoveOpen(true)}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                metrics={metrics}
                products={products}
                categories={categories}
                suppliers={suppliers}
                transactions={transactions}
                settings={settings}
                onNavigate={setActiveTab}
                onInitiateStockIn={startStockInWithProduct}
                onInitiateStockOut={startStockOutWithProduct}
                onInitiateAdjustment={startAdjustmentWithProduct}
                onOpenAddProduct={() => setActiveTab('products')}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                categories={categories}
                suppliers={suppliers}
                settings={settings}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onQuickStockIn={startStockInWithProduct}
                onQuickStockOut={startStockOutWithProduct}
                onQuickAdjust={startAdjustmentWithProduct}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesView
                categories={categories}
                onSaveCategory={handleSaveCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView
                suppliers={suppliers}
                onSaveSupplier={handleSaveSupplier}
                onDeleteSupplier={handleDeleteSupplier}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersView
                customers={customers}
                onSaveCustomer={handleSaveCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {activeTab === 'stock-in' && (
              <StockInView
                products={products}
                suppliers={suppliers}
                currentUser={currentUser}
                settings={settings}
                preselectedProductId={preselectedProductId}
                onSubmitStockIn={handleStockIn}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'stock-out' && (
              <StockOutView
                products={products}
                customers={customers}
                currentUser={currentUser}
                settings={settings}
                preselectedProductId={preselectedProductId}
                onSubmitStockOut={handleStockOut}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'adjustment' && (
              <StockAdjustmentView
                products={products}
                currentUser={currentUser}
                settings={settings}
                preselectedProductId={preselectedProductId}
                onSubmitAdjustment={handleStockAdjustment}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'movements' && (
              <MovementHistoryView transactions={transactions} settings={settings} />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                products={products}
                transactions={transactions}
                settings={settings}
                onInitiateStockIn={startStockInWithProduct}
              />
            )}

            {activeTab === 'gas-hub' && (
              <GoogleAppsScriptHub
                settings={settings}
                onSaveSettings={handleSaveSettings}
                showToast={showToast}
              />
            )}

            {activeTab === 'users' && (
              <UsersView
                users={users}
                currentUser={currentUser}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
                onSwitchUser={handleSwitchUser}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onResetDatabase={handleResetDatabase}
                onExportJson={handleExportJson}
                onNavigateToGasHub={() => setActiveTab('gas-hub')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Quick Movement Modal */}
      <QuickMovementModal
        isOpen={isQuickMoveOpen}
        onClose={() => setIsQuickMoveOpen(false)}
        products={products}
        suppliers={suppliers}
        customers={customers}
        currentUser={currentUser}
        settings={settings}
        onStockIn={handleStockIn}
        onStockOut={handleStockOut}
        onAdjustment={handleStockAdjustment}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <InventoryApp />
    </ToastProvider>
  );
}
