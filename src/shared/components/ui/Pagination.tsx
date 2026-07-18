import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  if (totalPages < 1) return null;

  // Generate page numbers array with dots/truncation
  const getPageRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount + first + last + current + 2*dots

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return [];
  };

  const pages = getPageRange();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
      
      {/* Mobile Page Information */}
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          Previous
        </button>
        <span className="text-xs font-medium text-slate-500 self-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          Next
        </button>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        
        {/* Results Counter / helper */}
        <div>
          <p className="text-sm text-slate-400 font-medium">
            Showing Page <span className="font-semibold text-slate-700">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
        </div>

        {/* Page navigation */}
        <div>
          <nav className="inline-flex -space-x-px rounded-md gap-1.5" aria-label="Pagination">
            
            {/* Prev Button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-9 h-9 text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            {pages.map((page, idx) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="inline-flex items-center justify-center w-9 h-9 text-slate-400 text-sm font-semibold select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`inline-flex items-center justify-center w-9 h-9 text-sm font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-red-500/10'
                      : 'text-slate-600 hover:bg-slate-50 border border-slate-200 bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-9 h-9 text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </nav>
        </div>

      </div>

    </div>
  );
};
