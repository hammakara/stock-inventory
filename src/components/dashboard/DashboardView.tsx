import React from 'react';
import {
  Product,
  Category,
  Supplier,
  StockTransaction,
  DashboardMetrics,
  AppSettings,
} from '../../types/inventory';
import { StockMovementChart, CategoryDistributionChart } from './StockCharts';
import {
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: StockTransaction[];
  settings: AppSettings;
  onNavigate: (tab: string) => void;
  onInitiateStockIn: (productId?: string) => void;
  onInitiateStockOut: (productId?: string) => void;
  onInitiateAdjustment: (productId?: string) => void;
  onOpenAddProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  products,
  categories,
  suppliers,
  transactions,
  settings,
  onNavigate,
  onInitiateStockIn,
  onInitiateStockOut,
  onInitiateAdjustment,
  onOpenAddProduct,
}) => {
  const lowStockItems = products
    .filter((p) => p.currentStock <= p.minimumStock)
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, 5);

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Operations Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time warehouse tracking, safety inventory monitoring, and Google Sheets sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onInitiateStockIn()}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Stock In</span>
          </button>
          <button
            onClick={() => onInitiateStockOut()}
            className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>Stock Out</span>
          </button>
          <button
            onClick={() => onInitiateAdjustment()}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust</span>
          </button>
          <button
            onClick={onOpenAddProduct}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New SKU</span>
          </button>
        </div>
      </div>

      {/* KPI Statistic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Valuation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Inventory Asset Value</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
              {settings.currencySymbol}
              {metrics.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Retail Value:</span>
            <span className="font-mono tabular-nums text-slate-700 font-semibold">
              {settings.currencySymbol}
              {metrics.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total SKUs & Units */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Catalog SKUs</span>
              <Package className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
              {metrics.totalProducts}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Total Units In Stock:</span>
            <span className="font-mono tabular-nums text-slate-700 font-semibold">
              {metrics.totalStockQuantity.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Low Stock Threshold Warnings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2 font-mono tabular-nums">
              {metrics.lowStockCount}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Threshold:</span>
            <span className="text-amber-700 font-medium">≤ Minimum Level</span>
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Out of Stock</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-2 font-mono tabular-nums">
              {metrics.outOfStockCount}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Action Required:</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-rose-600 hover:underline font-medium"
            >
              View Reorders →
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Movements 7-Day Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Stock Inbound vs Outbound (Last 7 Days)</h3>
              <p className="text-xs text-slate-500">Unit volume comparison across transactions</p>
            </div>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Full Audit History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <StockMovementChart transactions={transactions} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900 text-sm">Category Stock Share</h3>
              <button
                onClick={() => onNavigate('categories')}
                className="text-xs text-blue-600 hover:underline"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">On-hand unit volume distribution</p>
            <CategoryDistributionChart products={products} categories={categories} />
          </div>
        </div>
      </div>

      {/* Low Stock Reorder List & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reorder Priorities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Priority Queue</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {lowStockItems.length} alerts
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Items requiring immediate vendor replenishment</p>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              All inventory levels are currently above minimum safety thresholds.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.map((item) => {
                const isZero = item.currentStock === 0;
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="truncate">
                      <div className="font-medium text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.sku} · Min: {item.minimumStock} {item.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          isZero ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                      <button
                        onClick={() => onInitiateStockIn(item.id)}
                        className="px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                      >
                        Restock +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Recent Stock Transactions</h3>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs text-blue-600 hover:underline"
            >
              View All ({transactions.length})
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">Real-time ledger entries from warehouse floor</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3">Reference #</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                  <th className="py-2.5 px-3 text-right">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((t) => {
                  const isIn = t.type === 'IN';
                  const isOut = t.type === 'OUT';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold text-[10px] ${
                            isIn
                              ? 'text-emerald-700'
                              : isOut
                              ? 'text-amber-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-[180px]">
                        <div>{t.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.productSku}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{t.referenceNumber}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-semibold tabular-nums ${
                          isIn ? 'text-emerald-600' : isOut ? 'text-amber-600' : 'text-blue-600'
                        }`}
                      >
                        {isIn ? `+${t.quantity}` : `${t.quantity}`}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums font-medium">
                        {t.newStock}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 truncate max-w-[100px]">
                        {t.userName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
