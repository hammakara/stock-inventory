import React, { useState, useEffect } from 'react';
import { Product, Customer, User, AppSettings } from '../../types/inventory';
import { ArrowUpFromLine, Check, Package, AlertTriangle, AlertCircle } from 'lucide-react';

interface StockOutViewProps {
  products: Product[];
  customers: Customer[];
  currentUser: User;
  settings: AppSettings;
  preselectedProductId?: string;
  onSubmitStockOut: (data: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    referenceNumber: string;
    customerId?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const StockOutView: React.FC<StockOutViewProps> = ({
  products,
  customers,
  currentUser,
  settings,
  preselectedProductId,
  onSubmitStockOut,
  onCancel,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || '');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setSellingPrice(selectedProduct.sellingPrice);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!referenceNumber) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setReferenceNumber(`SO-${year}-${rand}`);
    }
  }, []);

  const requestedQty = Number(quantity) || 0;
  const currentStock = selectedProduct ? selectedProduct.currentStock : 0;
  const isInsufficientStock = selectedProduct ? requestedQty > currentStock : false;
  const projectedStock = selectedProduct ? currentStock - requestedQty : 0;
  const totalValue = requestedQty * (Number(sellingPrice) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    if (requestedQty <= 0) return;
    if (isInsufficientStock) return;

    setIsSubmitting(true);
    try {
      onSubmitStockOut({
        productId: selectedProductId,
        quantity: requestedQty,
        unitPrice: Number(sellingPrice) || undefined,
        referenceNumber: referenceNumber.trim(),
        customerId: customerId || undefined,
        notes: notes.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ArrowUpFromLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Stock Out (Dispatch Order)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Issue goods for customer orders, transfers, or job sites. Strict validation blocks negative balances.
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
                    {p.sku} · {p.name} (Available: {p.currentStock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Selling Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dispatch Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="e.g. 5"
                  className={`w-full px-3 py-2 text-xs font-mono bg-slate-50 border rounded-lg focus:outline-hidden ${
                    isInsufficientStock
                      ? 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {isInsufficientStock && (
                  <div className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Insufficient stock! Only {currentStock} available.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Reference & Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sales Order / Invoice Ref # *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. SO-2026-0922"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Client Account</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">Direct Dispatch / Walk-in</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dispatch Notes / Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Courier name, tracking code, shipping destination..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Actions */}
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
                disabled={isSubmitting || !selectedProductId || !quantity || isInsufficientStock}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Stock Out</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Safety Check Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Inventory Safety Check
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
                    <div className="text-slate-500 text-[11px]">Available Stock</div>
                    <div className="font-mono font-bold text-slate-800">
                      {selectedProduct.currentStock} {selectedProduct.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">Balance After Dispatch</div>
                    <div
                      className={`font-mono font-bold ${
                        isInsufficientStock
                          ? 'text-rose-600'
                          : projectedStock <= selectedProduct.minimumStock
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {projectedStock} {selectedProduct.unit}
                    </div>
                  </div>
                </div>

                {projectedStock <= selectedProduct.minimumStock && !isInsufficientStock && (
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] flex items-start gap-1.5 border border-amber-200/60">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Warning: This order will drop inventory to or below safety minimum ({selectedProduct.minimumStock} {selectedProduct.unit}).</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-500 text-[11px]">Order Financial Extension</div>
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
                Select a product SKU on the left to verify real-time available stock and safe dispatch limits.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
