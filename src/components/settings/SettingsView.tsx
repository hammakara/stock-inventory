import React, { useState } from 'react';
import { AppSettings } from '../../types/inventory';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Download,
  Building,
  DollarSign,
  AlertTriangle,
  FileCode2,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetDatabase: () => void;
  onExportJson: () => void;
  onNavigateToGasHub: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDatabase,
  onExportJson,
  onNavigateToGasHub,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">System Settings & Configurations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure enterprise parameters, default safety stock thresholds, and Google Sheets connectors.
          </p>
        </div>

        <button
          onClick={onNavigateToGasHub}
          className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Google Apps Script Hub →</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Organization Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Facility Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Address</label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Inventory Rules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Currency & Inventory Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
              <select
                value={formData.currency}
                onChange={(e) => {
                  const curr = e.target.value;
                  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$' };
                  setFormData({
                    ...formData,
                    currency: curr,
                    currencySymbol: symbols[curr] || '$',
                  });
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Low Stock Alert</label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThresholdDefault}
                onChange={(e) => setFormData({ ...formData, lowStockThresholdDefault: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">
            {isSaved ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Settings saved successfully
              </span>
            ) : (
              'Save changes to update system parameters'
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Database Maintenance & JSON Backup */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Data Backup & Maintenance</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-slate-900">Export Complete Database JSON Snapshot</div>
            <div className="text-slate-500">
              Download all products, categories, suppliers, transactions, and settings as a JSON file.
            </div>
          </div>
          <button
            type="button"
            onClick={onExportJson}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database JSON</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-rose-600">Reset to Default Seed Data</div>
            <div className="text-slate-500">
              Clears local changes and re-seeds with rich realistic sample inventory data.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={onResetDatabase}
        title="Reset All Inventory Data"
        message="Are you sure you want to restore the default sample dataset? This will clear custom transactions and restore initial warehouse stock."
        confirmLabel="Reset Data"
      />
    </div>
  );
};
