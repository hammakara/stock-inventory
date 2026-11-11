import React, { useState } from 'react';
import { GAS_FILES, SHEET_SCHEMAS, GasFileItem, ALL_IN_ONE_SCRIPT } from '../../services/gasExportData';
import { storage } from '../../services/storage';
import { AppSettings } from '../../types/inventory';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Table,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Globe,
  Database,
  ArrowRight,
  Shield,
  FileText,
  HardDrive,
  Cloud,
} from 'lucide-react';

interface GoogleAppsScriptHubProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const GoogleAppsScriptHub: React.FC<GoogleAppsScriptHubProps> = ({
  settings,
  onSaveSettings,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'schemas' | 'guide' | 'connect'>('connect');
  const [selectedFileName, setSelectedFileName] = useState<string>('Code.gs');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [copiedBootstrap, setCopiedBootstrap] = useState(false);

  // Live Web App URL connector state
  const [webAppUrl, setWebAppUrl] = useState(settings.googleAppsScriptUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState(settings.googleSheetsId || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedFile = GAS_FILES.find((f) => f.name === selectedFileName) || GAS_FILES[0];

  const handleCopyCode = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(name);
    showToast(`Copied ${name} to clipboard!`, 'success');
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleDownloadFile = (file: GasFileItem) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${file.name}`, 'info');
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      showToast('Please enter a Google Apps Script Web App URL first.', 'warning');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await storage.testGoogleAppsScriptConnection(webAppUrl);
      setTestResult(res);
      if (res.success) {
        showToast('Google Apps Script connection verified!', 'success');
        // Save URL into settings
        const updated = { ...settings, googleAppsScriptUrl: webAppUrl.trim(), googleSheetsId: spreadsheetId.trim() };
        onSaveSettings(updated);
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!webAppUrl.trim()) {
      showToast('Please enter and verify your Google Apps Script Web App URL first.', 'warning');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await storage.syncToGoogleSheets(webAppUrl);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Google Sheets & Apps Script Integration Studio
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete backend source code, Google Sheets database schemas, and live Web App API connector.
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('connect')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'connect'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Sheets Connection
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'files'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apps Script Code ({GAS_FILES.length})
            </button>
            <button
              onClick={() => setActiveTab('schemas')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'schemas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sheets Database Schemas
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'guide'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deployment Guide
            </button>
          </div>
        </div>
      </div>

      {/* 1. Live Connection & Webhook Setup */}
      {activeTab === 'connect' && (
        <div className="space-y-6">
          {/* Standalone Status Banner (No link required) */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Standalone Mode is Active & Ready</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    No Link Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  StockFlow includes a complete built-in local database engine. All products, stock in/out, adjustments, reports, suppliers, and customers are saved in your browser with full persistence. <strong>You can use all features right now without any Google Apps Script link!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 3-Minute Quick Setup Guide for Getting a Link */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>How to Get Your Free Google Apps Script Link (3 Minutes)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow this quick guide if you want to sync your warehouse data directly into a Google Sheet spreadsheet:
                </p>
              </div>

              {/* 1-Click Copy Bootstrap Script */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(ALL_IN_ONE_SCRIPT);
                  setCopiedBootstrap(true);
                  showToast('Copied 1-File Bootstrap Script to clipboard!', 'success');
                  setTimeout(() => setCopiedBootstrap(false), 2500);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
              >
                {copiedBootstrap ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBootstrap ? 'Copied to Clipboard!' : 'Copy 1-File Bootstrap Script'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Create a Google Sheet</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Open <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-2.5 h-2.5" /></a> and name your sheet &quot;StockFlow Database&quot;.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Open Apps Script & Paste</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>. Replace the empty function with the script copied above and save (<kbd className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[10px]">Ctrl+S</kbd>).
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Deploy & Copy Link</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Click <strong>Deploy &gt; New deployment &gt; Web app</strong>. Set <em>Who has access</em> to <strong>Anyone</strong>, click <strong>Deploy</strong>, and paste the generated URL below!
                </p>
              </div>
            </div>
          </div>

          {/* Form to connect the URL */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Paste Your Web App Link (Optional)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Once you have deployed your script, paste the Web app URL below to link your live Google Sheet.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Apps Script Web App Exec URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                    <span>Test Connection</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Obtained from Apps Script: <strong>Deploy &gt; Manage Deployments &gt; Web app URL</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Spreadsheet ID (Optional)
                </label>
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Found in your Google Sheet URL: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
                </div>
              </div>

              {/* Status feedback box */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{testResult.success ? 'Connected!' : 'Connection Failed'}</div>
                    <div className="mt-0.5">{testResult.message}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Last Synced: <span className="font-mono text-slate-700">{settings.lastSyncTime || 'Never'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncToSheets}
                    disabled={isSyncing || !webAppUrl}
                    className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync All Data to Google Sheets Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture diagram callout */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-blue-400">
              Dual-Deployment Architecture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/80 rounded-lg space-y-1">
                <div className="font-bold text-white text-xs">Option A: Deployed Apps Script Web App</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Host the full frontend directly within Google Apps Script via HTML Service (<code className="text-blue-300">doGet</code> renders <code className="text-blue-300">index.html</code>) and use native <code className="text-blue-300">google.script.run</code> for zero-latency execution!
                </p>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg space-y-1">
                <div className="font-bold text-white text-xs">Option B: Standalone Web App / Cloud Run</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Run this modern Vite + React SPA here in AI Studio, with localStorage caching and background HTTP POST webhook synchronization directly into Google Sheets!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. File Explorer & Source Code Inspector */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File List */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Apps Script Files
            </div>
            {GAS_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFileName(file.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  selectedFileName === file.name
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${selectedFileName === file.name ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] font-mono opacity-60">.{file.type}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
            {/* Viewer Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs">{selectedFile.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                    {selectedFile.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyCode(selectedFile.content, selectedFile.name)}
                  className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedFile === selectedFile.name ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{copiedFile === selectedFile.name ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. Database Schemas */}
      {activeTab === 'schemas' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Google Sheets Database Structure</h3>
            <p className="text-xs text-slate-500 mt-1">
              The Google Apps Script backend automatically creates and formats these 8 sheets with bold headers and frozen rows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHEET_SCHEMAS.map((schema) => (
              <div key={schema.tab} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">Tab: &quot;{schema.tab}&quot;</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${schema.color}`}>
                    {schema.columns.length} Columns
                  </span>
                </div>
                <div className="p-3 text-[11px] text-slate-500 border-b border-slate-100">
                  {schema.description}
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {schema.columns.map((col) => (
                    <div key={col.name} className="px-4 py-2 flex items-center justify-between gap-3">
                      <div className="font-mono font-medium text-slate-800 text-[11px] flex items-center gap-1.5">
                        <span>{col.name}</span>
                        {col.key && (
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-100 text-amber-800">
                            KEY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px] text-right">
                        {col.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 10-Phase Deployment Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Step-by-Step 10-Phase Google Sheets & Apps Script Deployment Guide
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Follow these exact instructions to deploy your live inventory backend in Google Sheets.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 text-xs">Phase 1: Create a Google Spreadsheet</div>
              <p>
                1. Navigate to <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">sheets.new</a> in your browser.<br />
                2. Rename the spreadsheet to <strong>&quot;StockFlow - Enterprise Inventory Database&quot;</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 text-xs">Phase 2: Open the Apps Script Editor</div>
              <p>
                In the Google Sheet menu bar, click <strong>Extensions &gt; Apps Script</strong>. A new tab will open with the Apps Script IDE.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 text-xs">Phase 3: Add the Backend Script Files (.gs)</div>
              <p>
                Inside the Apps Script editor, click the <strong>+</strong> button next to &quot;Files&quot;, choose <strong>Script</strong>, and create each of the 10 files below. Copy-paste the corresponding code from the <em>Apps Script Code</em> tab:
              </p>
              <ul className="list-disc pl-5 font-mono text-[11px] text-slate-600 mt-1 space-y-0.5">
                <li>Code.gs (Main router and web API)</li>
                <li>Config.gs (Spreadsheet config and sheet names)</li>
                <li>Database.gs (Data access layer and schema initializer)</li>
                <li>ProductService.gs (Product catalog management)</li>
                <li>CategoryService.gs (Category taxonomy management)</li>
                <li>SupplierService.gs (Supplier directory)</li>
                <li>InventoryService.gs (Stock In, Out, and Adjustments)</li>
                <li>ReportService.gs (Valuation and reorder reports)</li>
                <li>AuthService.gs (User permissions and RBAC)</li>
                <li>Validation.gs (Server-side validation)</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 text-xs">Phase 4: Run Initial Database Setup</div>
              <p>
                In the function dropdown at the top of the editor, select <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">initDatabase</code> or <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">Database.initializeDatabase</code> and click <strong>Run</strong>. Review and grant Google authorization permissions. All 8 sheets will be created automatically!
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 text-xs">Phase 5: Deploy as Web App</div>
              <p>
                1. Click the blue <strong>Deploy &gt; New deployment</strong> button.<br />
                2. Select type: <strong>Web app</strong>.<br />
                3. Set <em>Execute as</em>: <strong>Me (your account)</strong>.<br />
                4. Set <em>Who has access</em>: <strong>Anyone</strong>.<br />
                5. Click <strong>Deploy</strong> and copy the generated <strong>Web app URL</strong> (ending in <code className="font-mono text-blue-600">/exec</code>).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900 text-xs">Phase 6: Connect to StockFlow</div>
              <p>
                Return to this StockFlow dashboard, switch to the <em>Live Sheets Connection</em> tab, paste your Web app URL, and click <strong>Test Connection</strong>. You now have a real-time full-stack enterprise inventory system running against Google Sheets!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
