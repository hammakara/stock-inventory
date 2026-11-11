import React from 'react';
import {
  LayoutDashboard,
  Box,
  Tags,
  Truck,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  History,
  FileBarChart2,
  FileCode2,
  UserCog,
  Settings as SettingsIcon,
  AlertTriangle,
  ChevronRight,
  Database,
} from 'lucide-react';
import { User } from '../../types/inventory';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lowStockCount: number;
  currentUser: User;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lowStockCount,
  currentUser,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
    { id: 'products', label: 'Products & SKUs', icon: Box, group: 'Catalog' },
    { id: 'categories', label: 'Categories', icon: Tags, group: 'Catalog' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, group: 'Directory' },
    { id: 'customers', label: 'Customers', icon: Users, group: 'Directory' },
    { id: 'stock-in', label: 'Stock In', icon: ArrowDownToLine, group: 'Operations' },
    { id: 'stock-out', label: 'Stock Out', icon: ArrowUpFromLine, group: 'Operations' },
    { id: 'adjustment', label: 'Stock Adjustment', icon: SlidersHorizontal, group: 'Operations' },
    { id: 'movements', label: 'Movement History', icon: History, group: 'Operations' },
    { id: 'reports', label: 'Valuation & Reports', icon: FileBarChart2, group: 'Analytics' },
    { id: 'gas-hub', label: 'Google Sheets & GAS', icon: FileCode2, group: 'Integration' },
    { id: 'users', label: 'User Roles & RBAC', icon: UserCog, group: 'System' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, group: 'System' },
  ];

  const handleSelect = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const grouped = navItems.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation scrollable area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName}>
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {groupName}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isStockIn = item.id === 'stock-in';
                  const isStockOut = item.id === 'stock-out';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-white'
                              : isStockIn
                              ? 'text-emerald-400'
                              : isStockOut
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>

                      {/* Badges for alert or operational cues */}
                      {item.id === 'products' && lowStockCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 tabular-nums">
                          {lowStockCount}
                        </span>
                      )}
                      {item.id === 'gas-hub' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 uppercase">
                          Sheets
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info: Active session user & Database Status */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-slate-200 font-medium truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.role}</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="System operational" />
          </div>
        </div>
      </aside>
    </>
  );
};
