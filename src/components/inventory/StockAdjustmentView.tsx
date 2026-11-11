import React, { useState, useEffect } from 'react';
import { Product, User, AppSettings } from '../../types/inventory';
import { SlidersHorizontal, Check, Package, AlertTriangle, Scale } from 'lucide-react';

interface StockAdjustmentViewProps {
  products: Product[];
  currentUser: User;
  settings: AppSettings;
  preselectedProductId?: string;
  onSubmitAdjustment: (data: {
    productId: string;
    correctedStock: number;
    reason: string;
    notes?: string;
    referenceNumber?: string;
  }) => void;
  onCancel: () => void;
}

export const StockAdjustmentView: React.FC<StockAdjustmentViewProps> = ({
  products,
  currentUser,
  settings,
  preselectedProductId,
  onSubmitAdjustment,
  onCancel,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || '');
  const [correctedStock, setCorrectedStock] = useState<number | ''>('');
  const [reason, setReason] = useState('Cycle Count Discrepancy');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct && correctedStock === '') {
      setCorrectedStock(selectedProduct.currentStock);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!referenceNumber) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setReferenceNumber(`ADJ-${year}-${rand}`);
    }
  }, []);

  const previousStock = selectedProduct ? selectedProduct.currentStock : 0;
  const newStock = correctedStock === '' ? previousStock : Number(correctedStock);
  const difference = newStock - previousStock;
  const valuationImpact = selectedProduct ? difference * selectedProduct.costPrice : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    if (correctedStock === '' || Number(correctedStock) < 0) return;
    if (!reason) return;

    setIsSubmitting(true);
    try {
      onSubmitAdjustment({
        productId: selectedProductId,
        correctedStock: Number(correctedStock),
        reason,
        notes: notes.trim(),
        referenceNumber: referenceNumber.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Stock Adjustment & Physical Audit</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconcile physical inventory counts against system records with mandatory reason audit trail.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Product to Reconcile *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((prod) => prod.id === e.target.value);
                  if (p) setCorrectedStock(p.currentStock);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} · {p.name} (Recorded: {p.currentStock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Counted Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={correctedStock}
                  onChange={(e) => setCorrectedStock(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="Counted quantity"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Reason *</label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
                >
                  <option value="Cycle Count Discrepancy">Cycle Count Discrepancy</option>
                  <option value="Damaged Goods / Breakage">Damaged Goods / Breakage</option>
                  <option value="Loss or Shrinkage">Loss or Shrinkage</option>
                  <option value="Expired / Deprecated Batch">Expired / Deprecated Batch</option>
                  <option value="Customer Return Stock Intake">Customer Return Stock Intake</option>
                  <option value="Vendor Return Write-off">Vendor Return Write-off</option>
                  <option value="Other / Audit Correction">Other / Audit Correction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Reference Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. ADJ-2026-0044"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Justification / Audit Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of audit findings, shelf conditions, or root cause..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedProductId || correctedStock === ''}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Adjustment Record</span>
              </button>
            </div>
          </form>
        </div>

        {/* Discrepancy & Variance Analysis */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Variance Reconciliation</span>
              <Scale className="w-3.5 h-3.5 text-slate-400" />
            </h3>

            {selectedProduct ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-500">Selected Product</div>
                  <div className="font-semibold text-slate-900">{selectedProduct.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{selectedProduct.sku}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-slate-500 text-[11px]">System Record</div>
                    <div className="font-mono font-bold text-slate-800">
                      {previousStock} {selectedProduct.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">Physical Counted</div>
                    <div className="font-mono font-bold text-slate-900">
                      {newStock} {selectedProduct.unit}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Calculated Difference:</span>
                    <span
                      className={`font-mono font-bold text-sm tabular-nums ${
                        difference > 0
                          ? 'text-emerald-600'
                          : difference < 0
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {difference > 0 ? `+${difference}` : difference} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500 text-[10px]">Valuation Impact:</span>
                    <span
                      className={`font-mono font-semibold text-xs tabular-nums ${
                        valuationImpact >= 0 ? 'text-slate-800' : 'text-rose-600'
                      }`}
                    >
                      {valuationImpact >= 0 ? '+' : ''}
                      {settings.currencySymbol}
                      {valuationImpact.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <span>Auditor: </span>
                  <span className="text-slate-700 font-medium">{currentUser.name}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Select a product to compute discrepancy variance and write-off value.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
