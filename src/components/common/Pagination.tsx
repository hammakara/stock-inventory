import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  if (totalItems <= pageSize) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
        <span>Showing all {totalItems} items</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
      <div className="flex items-center gap-1">
        <span>Showing</span>
        <span className="font-semibold text-slate-800 tabular-nums">{startItem}</span>
        <span>to</span>
        <span className="font-semibold text-slate-800 tabular-nums">{endItem}</span>
        <span>of</span>
        <span className="font-semibold text-slate-800 tabular-nums">{totalItems}</span>
        <span>results</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="px-2 py-1 text-slate-700 font-medium tabular-nums">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
