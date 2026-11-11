import React from 'react';
import { User, UserRole } from '../../types/inventory';
import { Layers, ShieldCheck, UserCheck, ArrowRightLeft, Menu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenQuickMove: () => void;
  onToggleSidebarMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenQuickMove,
  onToggleSidebarMobile,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-8 shrink-0 z-30 sticky top-0">
      {/* Zone 1: Brand Wordmark (Single text element wordmark) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            SF
          </span>
          <span>StockFlow</span>
        </button>
      </div>

      {/* Zone 2: 4–5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'dashboard' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('products')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'products' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : ''
          }`}
        >
          Catalog & SKUs
        </button>
        <button
          onClick={() => onSelectTab('movements')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
            ['stock-in', 'stock-out', 'adjustment', 'movements'].includes(activeTab)
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : ''
          }`}
        >
          Stock Movements
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'reports' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : ''
          }`}
        >
          Valuation Reports
        </button>
        <button
          onClick={() => onSelectTab('gas-hub')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'gas-hub' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : ''
          }`}
        >
          Google Sheets & Apps Script
        </button>
      </nav>

      {/* Zone 3: 1 primary action / context element */}
      <div className="flex items-center gap-3 shrink-0">
        {/* User Role Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-lg text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-slate-500 text-[11px]">Role:</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = allUsers.find((usr) => usr.id === e.target.value);
              if (u) onSwitchUser(u);
            }}
            className="bg-transparent font-medium text-slate-800 text-xs focus:outline-hidden cursor-pointer"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenQuickMove}
          className="px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Quick Movement</span>
        </button>
      </div>
    </header>
  );
};
