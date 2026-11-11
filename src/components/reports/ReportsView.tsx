import React, { useState } from 'react';
import { Product, StockTransaction, AppSettings } from '../../types/inventory';
import {
  FileBarChart2,
  DollarSign,
  AlertTriangle,
  Download,
  Printer,
  TrendingUp,
  Percent,
  Package,
  ArrowDownToLine,
} from 'lucide-react';

interface ReportsViewProps {
  products: Product[];
  transactions: StockTransaction[];
  settings: AppSettings;
  onInitiateStockIn: (productId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  transactions,
  settings,
  onInitiateStockIn,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'valuation' | 'reorder' | 'turnover'>('valuation');

  // 1. Valuation Calculations
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let totalUnits = 0;

  const valuationItems = products.map((p) => {
    const cost = p.costPrice;
    const sell = p.sellingPrice;
    const stock = p.currentStock;
    const itemCostValue = stock * cost;
    const itemRetailValue = stock * sell;
    const potentialProfit = itemRetailValue - itemCostValue;
    const marginPercent = sell > 0 ? ((sell - cost) / sell) * 100 : 0;

    totalUnits += stock;
    totalCostValue += itemCostValue;
    totalRetailValue += itemRetailValue;

    return {
      ...p,
      itemCostValue,
      itemRetailValue,
      potentialProfit,
      marginPercent,
    };
  });

  const overallGrossProfit = totalRetailValue - totalCostValue;
  const overallMargin = totalRetailValue > 0 ? (overallGrossProfit / totalRetailValue) * 100 : 0;

  // 2. Reorder Advisory Calculations
  const lowStockItems = products
    .filter((p) => p.currentStock <= p.minimumStock)
    .map((p) => {
      const deficit = p.minimumStock - p.currentStock;
      const recommendedOrder = deficit > 0 ? deficit + Math.max(10, p.minimumStock) : Math.max(10, p.minimumStock);
      const estimatedCost = recommendedOrder * p.costPrice;
      return {
        ...p,
        recommendedOrder,
        estimatedCost,
        isCritical: p.currentStock === 0,
      };
    });

  const totalReorderCapital = lowStockItems.reduce((acc, item) => acc + item.estimatedCost, 0);

  // Export handlers
  const exportValuationCsv = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Current Stock',
      'Unit',
      'Unit Cost',
      'Unit Price',
      'Total Asset Cost',
      'Total Retail Value',
      'Potential Profit',
      'Gross Margin %',
    ];

    const rows = valuationItems.map((item) => [
      item.sku,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.categoryName || ''}"`,
      item.currentStock,
      item.unit,
      item.costPrice,
      item.sellingPrice,
      item.itemCostValue.toFixed(2),
      item.itemRetailValue.toFixed(2),
      item.potentialProfit.toFixed(2),
      item.marginPercent.toFixed(1),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory-valuation-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReorderCsv = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Supplier',
      'Current Stock',
      'Minimum Safety Threshold',
      'Recommended Order Units',
      'Unit Cost',
      'Estimated Reorder Cost',
      'Severity',
    ];

    const rows = lowStockItems.map((item) => [
      item.sku,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.supplierName || ''}"`,
      item.currentStock,
      item.minimumStock,
      item.recommendedOrder,
      item.costPrice,
      item.estimatedCost.toFixed(2),
      item.isCritical ? 'CRITICAL_OUT_OF_STOCK' : 'LOW_STOCK',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `low-stock-reorders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Financial & Inventory Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Asset valuation, profitability margins, safety stock deficits, and procurement schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveReportTab('valuation')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeReportTab === 'valuation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Valuation
            </button>
            <button
              onClick={() => setActiveReportTab('reorder')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeReportTab === 'reorder'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Reorder Advisory</span>
              {lowStockItems.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 font-bold rounded-sm text-[10px]">
                  {lowStockItems.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              if (activeReportTab === 'valuation') exportValuationCsv();
              else exportReorderCsv();
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Valuation Report Tab */}
      {activeReportTab === 'valuation' && (
        <div className="space-y-4">
          {/* Valuation KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-medium text-slate-500">Asset Cost Basis</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                {settings.currencySymbol}
                {totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {totalUnits.toLocaleString()} units on hand
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-medium text-slate-500">Retail Sales Valuation</div>
              <div className="text-2xl font-bold text-blue-600 mt-1 font-mono tabular-nums">
                {settings.currencySymbol}
                {totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">Realizable revenue</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-medium text-slate-500">Potential Gross Profit</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
                {settings.currencySymbol}
                {overallGrossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">Retail minus cost basis</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-medium text-slate-500">Average Gross Margin</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                {overallMargin.toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">Across catalog inventory</div>
            </div>
          </div>

          {/* Valuation Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm">SKU Valuation & Margin Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">On-Hand</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Total Asset Cost</th>
                    <th className="py-3 px-4 text-right">Retail Value</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {valuationItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{item.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[220px] truncate">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-800">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        {settings.currencySymbol}
                        {item.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 font-medium">
                        {settings.currencySymbol}
                        {item.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 font-semibold">
                        {settings.currencySymbol}
                        {item.itemCostValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-600 font-semibold">
                        {settings.currencySymbol}
                        {item.itemRetailValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-600">
                        {item.marginPercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Low Stock Reorder Advisory Tab */}
      {activeReportTab === 'reorder' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-medium text-slate-500">Items Requiring Reorder</div>
              <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
                {lowStockItems.length} SKUs
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lowStockItems.filter((i) => i.isCritical).length} items currently out of stock
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs font-medium text-slate-500">Estimated Reorder Investment</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                {settings.currencySymbol}
                {totalReorderCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Capital needed to restore safety stock levels
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm">Procurement Reorder Priority List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-center">Current Stock</th>
                    <th className="py-3 px-4 text-center">Safety Minimum</th>
                    <th className="py-3 px-4 text-center">Recommended Order</th>
                    <th className="py-3 px-4 text-right">Est. Cost</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No products are currently at or below minimum threshold.
                      </td>
                    </tr>
                  ) : (
                    lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">{item.sku}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                          {item.supplierName || 'Default Supplier'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              item.isCritical ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                          {item.minimumStock} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-blue-600 tabular-nums">
                          +{item.recommendedOrder} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-semibold">
                          {settings.currencySymbol}
                          {item.estimatedCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onInitiateStockIn(item.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <ArrowDownToLine className="w-3 h-3" />
                            <span>Stock In</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
