import React, { useState, useMemo } from 'react';
import { StockTransaction, AppSettings } from '../../types/inventory';
import { Pagination } from '../common/Pagination';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';

interface MovementHistoryViewProps {
  transactions: StockTransaction[];
  settings: AppSettings;
}

export const MovementHistoryView: React.FC<MovementHistoryViewProps> = ({
  transactions,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchSearch =
        t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.supplierOrCustomer && t.supplierOrCustomer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.userName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, searchTerm, typeFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const exportCsv = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'SKU',
      'Product Name',
      'Quantity Change',
      'Previous Stock',
      'New Stock Balance',
      'Unit Price',
      'Total Value',
      'Reference Number',
      'Party (Supplier/Customer)',
      'Reason',
      'Notes',
      'User / Operator',
    ];

    const rows = filtered.map((t) => [
      t.id,
      t.date,
      t.type,
      t.productSku,
      `"${t.productName.replace(/"/g, '""')}"`,
      t.quantity,
      t.previousStock,
      t.newStock,
      t.unitPrice,
      t.totalValue,
      t.referenceNumber,
      `"${(t.supplierOrCustomer || '').replace(/"/g, '""')}"`,
      `"${(t.reason || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${t.userName.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock-movements-audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Stock Movement Audit Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable historical transaction record of all receipts, dispatches, and inventory adjustments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by SKU, product name, PO/SO reference, party, or user..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'IN', 'OUT', 'ADJUSTMENT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4">SKU & Product</th>
                <th className="py-3 px-4 text-right">Qty Delta</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total Ext</th>
                <th className="py-3 px-4">Party / Destination</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const isIn = t.type === 'IN';
                  const isOut = t.type === 'OUT';
                  const dateStr = new Date(t.date).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                            isIn
                              ? 'bg-emerald-50 text-emerald-700'
                              : isOut
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {t.referenceNumber}
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-medium text-slate-900 truncate" title={t.productName}>
                          {t.productName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{t.productSku}</div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                          isIn
                            ? 'text-emerald-600'
                            : isOut
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums font-semibold whitespace-nowrap">
                        {t.newStock}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {settings.currencySymbol}
                        {Number(t.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {settings.currencySymbol}
                        {Math.abs(t.totalValue).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                        {t.supplierOrCustomer || t.reason || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-[110px]">
                        {t.userName}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
