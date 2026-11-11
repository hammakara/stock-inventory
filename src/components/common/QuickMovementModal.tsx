import React, { useState } from 'react';
import { Product, Supplier, Customer, User, AppSettings } from '../../types/inventory';
import { Modal } from './Modal';
import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, Check } from 'lucide-react';

interface QuickMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  currentUser: User;
  settings: AppSettings;
  onStockIn: (data: any) => void;
  onStockOut: (data: any) => void;
  onAdjustment: (data: any) => void;
}

export const QuickMovementModal: React.FC<QuickMovementModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  customers,
  currentUser,
  settings,
  onStockIn,
  onStockOut,
  onAdjustment,
}) => {
  const [moveType, setMoveType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number | ''>(5);
  const [refNumber, setRefNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [adjReason, setAdjReason] = useState('Cycle Count Discrepancy');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selected productId when products list is available
  React.useEffect(() => {
    if (!productId && products.length > 0) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productId || quantity === '') {
      setErrorMessage('Please select a product and enter a valid quantity.');
      return;
    }

    const numQty = Number(quantity);
    if (numQty <= 0 && moveType !== 'ADJUST') {
      setErrorMessage('Quantity must be greater than zero.');
      return;
    }

    if (moveType === 'IN') {
      onStockIn({
        productId,
        quantity: numQty,
        unitPrice: selectedProduct?.costPrice || 0,
        referenceNumber: refNumber || `PO-QUICK-${Date.now().toString().slice(-4)}`,
        notes: notes || 'Quick movement receipt',
      });
    } else if (moveType === 'OUT') {
      if (selectedProduct && numQty > selectedProduct.currentStock) {
        setErrorMessage(
          `Insufficient stock! Requested: ${numQty} ${selectedProduct.unit}, Available: ${selectedProduct.currentStock} ${selectedProduct.unit}. Negative stock is prohibited.`
        );
        return;
      }
      onStockOut({
        productId,
        quantity: numQty,
        unitPrice: selectedProduct?.sellingPrice || 0,
        referenceNumber: refNumber || `SO-QUICK-${Date.now().toString().slice(-4)}`,
        notes: notes || 'Quick movement dispatch',
      });
    } else {
      onAdjustment({
        productId,
        correctedStock: numQty,
        reason: adjReason,
        notes: notes || 'Quick stock reconciliation',
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Stock Movement"
      subtitle="Rapidly record inventory transactions without leaving your current workspace"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Type Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMoveType('IN')}
            className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              moveType === 'IN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Stock In</span>
          </button>
          <button
            type="button"
            onClick={() => setMoveType('OUT')}
            className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              moveType === 'OUT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>Stock Out</span>
          </button>
          <button
            type="button"
            onClick={() => setMoveType('ADJUST')}
            className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              moveType === 'ADJUST'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust</span>
          </button>
        </div>

        {/* Product selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product *</label>
          <select
            required
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              const p = products.find((prod) => prod.id === e.target.value);
              if (moveType === 'ADJUST' && p) setQuantity(p.currentStock);
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} · {p.name} (On-hand: {p.currentStock} {p.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {moveType === 'ADJUST' ? 'Physical Counted Quantity *' : 'Quantity *'}
          </label>
          <input
            type="number"
            min="0"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
          {selectedProduct && (
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Current On-Hand: <strong>{selectedProduct.currentStock} {selectedProduct.unit}</strong></span>
              {moveType === 'OUT' && (
                <span className={Number(quantity) > selectedProduct.currentStock ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                  Remaining: {selectedProduct.currentStock - (Number(quantity) || 0)}
                </span>
              )}
              {moveType === 'IN' && (
                <span className="text-emerald-600 font-semibold">
                  New Total: {selectedProduct.currentStock + (Number(quantity) || 0)}
                </span>
              )}
            </div>
          )}
        </div>

        {moveType === 'ADJUST' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Reason</label>
            <select
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            >
              <option value="Cycle Count Discrepancy">Cycle Count Discrepancy</option>
              <option value="Damaged Goods">Damaged Goods</option>
              <option value="Shrinkage / Loss">Shrinkage / Loss</option>
              <option value="Expired Stock">Expired Stock</option>
              <option value="Customer Return">Customer Return</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Number</label>
          <input
            type="text"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            placeholder="e.g. REF-2026-901"
            className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
          >
            Execute Movement
          </button>
        </div>
      </form>
    </Modal>
  );
};
