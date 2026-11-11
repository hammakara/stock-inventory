import React, { useState, useEffect } from 'react';
import { Product, Supplier, User, AppSettings } from '../../types/inventory';
import { ArrowDownToLine, Check, Package, AlertCircle } from 'lucide-react';

interface StockInViewProps {
  products: Product[];
  suppliers: Supplier[];
  currentUser: User;
  settings: AppSettings;
  preselectedProductId?: string;
  onSubmitStockIn: (data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    referenceNumber: string;
    supplierId?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const StockInView: React.FC<StockInViewProps> = ({
  products,
  suppliers,
  currentUser,
  settings,
  preselectedProductId,
  onSubmitStockIn,
  onCancel,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || '');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // When product changes, prefill default unit cost and supplier
  useEffect(() => {
    if (selectedProduct) {
      setUnitCost(selectedProduct.costPrice);
      if (selectedProduct.supplierId) {
        setSupplierId(selectedProduct.supplierId);
      }
    }
  }, [selectedProduct]);

  // Generate reference number on mount if empty
  useEffect(() => {
    if (!referenceNumber) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setReferenceNumber(`PO-${year}-${rand}`);
    }
  }, []);

  const totalValue = (Number(quantity) || 0) * (Number(unitCost) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    if (!quantity || Number(quantity) <= 0) return;

    setIsSubmitting(true);
    try {
      onSubmitStockIn({
        productId: selectedProductId,
        quantity: Number(quantity),
        unitPrice: Number(unitCost) || 0,
        referenceNumber: referenceNumber.trim(),
        supplierId: supplierId || undefined,
        notes: notes.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Stock In (Inbound Receipt)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive vendor shipments or production inventory into warehouse on-hand balance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Product SKU *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="">-- Choose Catalog Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} · {p.name} (Current: {p.currentStock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Unit Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inbound Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Cost ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Reference & Supplier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Order / Ref # *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. PO-2026-0881"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">Direct / Unspecified</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receiving Remarks / Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Inspection notes, dock bay, bill of lading number..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Submit */}
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
                disabled={isSubmitting || !selectedProductId || !quantity}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Stock In</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Calculation & Product Preview Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Transaction Summary
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
                    <div className="text-slate-500 text-[11px]">Current On-Hand</div>
                    <div className="font-mono font-bold text-slate-800">
                      {selectedProduct.currentStock} {selectedProduct.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">New Projected Stock</div>
                    <div className="font-mono font-bold text-emerald-600">
                      {selectedProduct.currentStock + (Number(quantity) || 0)} {selectedProduct.unit}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Total Transaction Value</div>
                  <div className="font-mono font-bold text-base text-slate-900 tabular-nums">
                    {settings.currencySymbol}
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Authorized by: </span>
                  <span className="text-slate-700 font-medium">{currentUser.name}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Select a product SKU on the left to view real-time stock balances and cost calculations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
