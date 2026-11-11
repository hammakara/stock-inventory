import React, { useState, useMemo } from 'react';
import { Product, Category, Supplier, AppSettings, ProductStatus } from '../../types/inventory';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  ArrowUpDown,
  Barcode,
  Layers,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  settings: AppSettings;
  onSaveProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDeleteProduct: (id: string) => void;
  onQuickStockIn: (productId: string) => void;
  onQuickStockOut: (productId: string) => void;
  onQuickAdjust: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  suppliers,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onQuickStockIn,
  onQuickStockOut,
  onQuickAdjust,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'sku' | 'name' | 'stock' | 'cost' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    supplierId: '',
    unit: 'pcs',
    costPrice: 0,
    sellingPrice: 0,
    minimumStock: 10,
    currentStock: 0,
    status: 'Active' as ProductStatus,
    location: '',
    description: '',
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      barcode: `8901${Math.floor(10000000 + Math.random() * 90000000)}`,
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      unit: 'pcs',
      costPrice: 10.0,
      sellingPrice: 18.5,
      minimumStock: settings.lowStockThresholdDefault || 10,
      currentStock: 25,
      status: 'Active',
      location: 'Aisle A - Bin 01',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      unit: p.unit,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      minimumStock: p.minimumStock,
      currentStock: p.currentStock,
      status: p.status,
      location: p.location || '',
      description: p.description || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProduct({
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      barcode: formData.barcode.trim(),
      categoryId: formData.categoryId,
      categoryName: categories.find((c) => c.id === formData.categoryId)?.name,
      supplierId: formData.supplierId,
      supplierName: suppliers.find((s) => s.id === formData.supplierId)?.companyName,
      unit: formData.unit,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      minimumStock: Number(formData.minimumStock),
      currentStock: Number(formData.currentStock),
      status: formData.status,
      location: formData.location,
      description: formData.description,
    });
    setIsModalOpen(false);
  };

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchSupplier = !supplierFilter || p.supplierId === supplierFilter;

      let matchStock = true;
      if (stockStatusFilter === 'OUT') matchStock = p.currentStock === 0;
      else if (stockStatusFilter === 'LOW') matchStock = p.currentStock > 0 && p.currentStock <= p.minimumStock;
      else if (stockStatusFilter === 'OK') matchStock = p.currentStock > p.minimumStock;

      return matchSearch && matchCategory && matchSupplier && matchStock;
    }).sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortBy === 'sku') {
        valA = a.sku.toLowerCase();
        valB = b.sku.toLowerCase();
      } else if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'stock') {
        valA = a.currentStock;
        valB = b.currentStock;
      } else if (sortBy === 'cost') {
        valA = a.costPrice;
        valB = b.costPrice;
      } else if (sortBy === 'price') {
        valA = a.sellingPrice;
        valB = b.sellingPrice;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, categoryFilter, supplierFilter, stockStatusFilter, sortBy, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const exportCsv = () => {
    const headers = [
      'Product ID',
      'SKU',
      'Barcode',
      'Product Name',
      'Category',
      'Supplier',
      'Unit',
      'Cost Price',
      'Selling Price',
      'Minimum Stock',
      'Current Stock',
      'Status',
      'Location',
    ];
    const rows = filteredProducts.map((p) => [
      p.id,
      p.sku,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.categoryName || ''}"`,
      `"${p.supplierName || ''}"`,
      p.unit,
      p.costPrice,
      p.sellingPrice,
      p.minimumStock,
      p.currentStock,
      p.status,
      `"${p.location || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory-catalog-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top action & filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Product Catalog Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage inventory master records, cost baselines, selling prices, and reorder triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by SKU, name, barcode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Supplier filter */}
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Suppliers ({suppliers.length})</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </select>

          {/* Stock Level filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => {
              setStockStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 cursor-pointer font-medium"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="OK">In Stock (Normal)</option>
            <option value="LOW">Low Stock Warning (≤ Min)</option>
            <option value="OUT">Out of Stock (Zero)</option>
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th
                  onClick={() => {
                    if (sortBy === 'sku') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('sku');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>SKU / Barcode</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('name');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Supplier</th>
                <th
                  onClick={() => {
                    if (sortBy === 'cost') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('cost');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'price') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('price');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'stock') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('stock');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>On-Hand Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No products matched your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isZero = p.currentStock === 0;
                  const isLow = !isZero && p.currentStock <= p.minimumStock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* SKU & Barcode */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-800">{p.sku}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          <span>{p.barcode}</span>
                        </div>
                      </td>

                      {/* Name & Location */}
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="font-semibold text-slate-900 truncate" title={p.name}>
                          {p.name}
                        </div>
                        {p.location && (
                          <div className="text-[11px] text-slate-400 truncate">Loc: {p.location}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                        {p.categoryName || 'General'}
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                        {p.supplierName || '-'}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        {settings.currencySymbol}
                        {Number(p.costPrice).toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {settings.currencySymbol}
                        {Number(p.sellingPrice).toFixed(2)}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-4 text-center">
                        <div
                          className={`font-mono font-bold tabular-nums text-xs ${
                            isZero
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Min: {p.minimumStock}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.status === 'Inactive'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Operational Actions */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onQuickStockIn(p.id)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Stock In +"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onQuickStockOut(p.id)}
                          disabled={p.currentStock === 0}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Stock Out -"
                        >
                          <ArrowUpFromLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onQuickAdjust(p.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Adjust Stock"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Product Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Inventory SKU'}
        subtitle="Configure master product records, reorder safety thresholds, and unit costs"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Optical Incremental Rotary Encoder"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SKU-ENG-101"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode / EAN</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 890123456001"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="pcs, box, kg..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Safety Stock</label>
              <input
                type="number"
                min="0"
                required
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial / Current Stock</label>
              <input
                type="number"
                min="0"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Aisle A - Rack 2 - Bin 14"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical specifications, dimensions, application details..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) onDeleteProduct(deletingProduct.id);
        }}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deletingProduct?.name}" (${deletingProduct?.sku})? This action will remove it from the catalog.`}
        confirmLabel="Delete SKU"
      />
    </div>
  );
};
