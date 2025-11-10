import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Eye, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionMenuProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  /** If true, forces the menu to open above the trigger (used for last rows) */
  isLast?: boolean;
  /** Index of the row (0-based) - helps determine if near bottom */
  rowIndex?: number;
  /** Total number of rows - helps determine if near bottom */
  totalRows?: number;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onView, onDelete, isLast, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showIconFallback, setShowIconFallback] = useState(false);

  // Check if row is near bottom (last 3 rows)
  const isNearBottom = typeof rowIndex === 'number' && typeof totalRows === 'number' 
    ? (totalRows - rowIndex) <= 3
    : false;

  useEffect(() => {
    const checkPosition = (): boolean => {
      if (!containerRef.current) return false;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Estimate menu height (approximately 140px for 3 items with padding)
      const estimatedMenuHeight = 140;
      const buffer = 30;
      const requiredSpace = estimatedMenuHeight + buffer;

      // Detect small/mobile viewport
      const isMobileViewport = typeof window !== 'undefined' ? window.innerWidth <= 640 : false;
      
      // For last 3 rows, use more aggressive positioning
      if (isLast || isNearBottom) {
        const aggressiveBuffer = 50;
        // On narrow/mobile viewports, force the menu to open above for the
        // second-last/last rows so it doesn't get clipped by the bottom of the
        // viewport (common on mobile where height is limited).
        if (isMobileViewport && typeof rowIndex === 'number' && typeof totalRows === 'number' && (totalRows - rowIndex) <= 2) {
          return true;
        }

        // Show above if space below is less than menu + aggressive buffer
        // OR if there's not enough space below but enough above
        return spaceBelow < (estimatedMenuHeight + aggressiveBuffer) || 
               (spaceBelow < requiredSpace && spaceAbove >= requiredSpace);
      }

      // For other rows, use standard logic
      return spaceBelow < requiredSpace && spaceAbove >= requiredSpace;
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const shouldShowAbove = checkPosition();
        setShowAbove(shouldShowAbove);
      }
    };

    if (isOpen) {
      // Immediately check position when menu opens
      const initialCheck = () => {
        if (containerRef.current) {
          const isMobileViewport = typeof window !== 'undefined' ? window.innerWidth <= 640 : false;
          const rect = containerRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;
          const estimatedMenuHeight = 140;
          const buffer = 30;
          const requiredSpace = estimatedMenuHeight + buffer;
          
          if (isLast || isNearBottom) {
            const aggressiveBuffer = 50;
            // Force above on mobile for second-last/last rows
            if (isMobileViewport && typeof rowIndex === 'number' && typeof totalRows === 'number' && (totalRows - rowIndex) <= 2) {
              setShowAbove(true);
            } else {
              const shouldShowAbove = 
                spaceBelow < (estimatedMenuHeight + aggressiveBuffer) || 
                (spaceBelow < requiredSpace && spaceAbove >= requiredSpace);
              setShowAbove(shouldShowAbove);
            }
          } else {
            const shouldShowAbove = 
              spaceBelow < requiredSpace && spaceAbove >= requiredSpace;
            setShowAbove(shouldShowAbove);
          }
        }
      };
      
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(initialCheck, 0);
      
      // Update position on scroll/resize when menu is open
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isLast, rowIndex, totalRows, isNearBottom]);

  // Runtime check to detect if SVG icon is rendering; show text fallback '⋯' if not
  useEffect(() => {
    const checkIcon = () => {
      const btn = toggleRef.current;
      if (!btn) {
        setShowIconFallback(true);
        return;
      }
      const svg = btn.querySelector('svg');
      if (!svg) {
        setShowIconFallback(true);
        return;
      }
      const style = window.getComputedStyle(svg);
      const rect = svg.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
        setShowIconFallback(true);
      } else {
        setShowIconFallback(false);
      }
    };

    const id = window.setTimeout(checkIcon, 0);
    window.addEventListener('resize', checkIcon);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', checkIcon);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const isMobileViewport = typeof window !== 'undefined' ? window.innerWidth <= 640 : false;
      // Check position before opening
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedMenuHeight = 140;
      const buffer = 30;
      const requiredSpace = estimatedMenuHeight + buffer;
      
      // For last 3 rows, be more aggressive - show above if space below is less than menu + large buffer
      // This ensures menu doesn't get cut off for second last and third last rows
      if (isLast || isNearBottom) {
        // For near-bottom rows, use a larger buffer to ensure menu is fully visible
        const aggressiveBuffer = 50;
        // On mobile viewports, for the second-last/last rows, force showing above
        if (isMobileViewport && typeof rowIndex === 'number' && typeof totalRows === 'number' && (totalRows - rowIndex) <= 2) {
          setShowAbove(true);
        } else {
          const shouldShowAbove = 
            spaceBelow < (estimatedMenuHeight + aggressiveBuffer) || 
            (spaceBelow < requiredSpace && spaceAbove >= requiredSpace);
          setShowAbove(shouldShowAbove);
        }
      } else {
        // For other rows, use normal logic
        const shouldShowAbove = 
          spaceBelow < requiredSpace && spaceAbove >= requiredSpace;
        setShowAbove(shouldShowAbove);
      }
    }
    setIsOpen((v) => !v);
  };

  return (
    <div className="relative inline-flex z-10" ref={containerRef}>
      {/* Toggle Button */}
      <button
        ref={toggleRef}
        onClick={handleToggle}
        // inline styles to prevent external CSS from forcing a blue background or border
        style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0, border: 'none', outline: 'none' }}
        className={
          `inline-flex items-center justify-center w-8 h-8 rounded-full
           hover:bg-gray-100 text-gray-600
           focus:outline-none
           transition-all duration-200 ease-in-out`
        }
        title="Actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open actions menu"
      >
        {/* Render either the SVG icon or a plain text fallback — never both */}
        {showIconFallback ? (
          <span aria-hidden className="text-gray-600 text-base leading-none">⋯</span>
        ) : (
          <MoreHorizontal size={16} color="#4B5563" strokeWidth={2} />
        )}
      </button>

      {/* Dropdown Menu - Using portal-like positioning */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: showAbove ? 8 : -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: showAbove ? 8 : -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            role="menu"
            aria-orientation="vertical"
            className={`
              absolute right-0
              ${showAbove ? 'bottom-full mb-2' : 'top-full mt-2'}
              bg-white rounded-lg shadow-xl border border-gray-200
              py-1.5 min-w-[160px]
              focus:outline-none
              z-[9999]
            `}
            onClick={(e) => e.stopPropagation()}
          >
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setIsOpen(false);
                  }}
                  style={{ backgroundColor: 'white', boxShadow: 'none', outline: 'none' }}
                  className="
                      w-full px-4 py-2.5 text-sm font-medium
                      text-gray-700 hover:text-gray-700 hover:bg-white
                      flex items-center gap-3
                      transition-colors duration-150 ease-in-out
                      first:rounded-t-lg last:rounded-b-lg
                      focus:outline-none focus:bg-white focus:text-gray-700
                    "
                  role="menuitem"
                  tabIndex={0}
                >
                  <Edit className="w-4 h-4 flex-shrink-0" />
                  <span>Edit</span>
                </button>
              )}

              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                    setIsOpen(false);
                  }}
                  style={{ backgroundColor: 'white', boxShadow: 'none', outline: 'none' }}
                  className="
                      w-full px-4 py-2.5 text-sm font-medium
                      text-gray-700 hover:text-gray-700 hover:bg-white
                      flex items-center gap-3
                      transition-colors duration-150 ease-in-out
                      first:rounded-t-lg last:rounded-b-lg
                      focus:outline-none focus:bg-white focus:text-gray-700
                    "
                  role="menuitem"
                  tabIndex={0}
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>View</span>
                </button>
              )}

              {onDelete && (
                <>
                  {(onEdit || onView) && (
                    <div className="my-1 border-t border-gray-200" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setIsOpen(false);
                    }}
                    style={{ backgroundColor: 'white', boxShadow: 'none', outline: 'none' }}
                    className="
                        w-full px-4 py-2.5 text-sm font-medium
                        text-red-600 hover:text-red-700 hover:bg-white
                        flex items-center gap-3
                        transition-colors duration-150 ease-in-out
                        first:rounded-t-lg last:rounded-b-lg
                        focus:outline-none focus:bg-white focus:text-red-700
                      "
                    role="menuitem"
                    tabIndex={0}
                  >
                    <Trash className="w-4 h-4 flex-shrink-0" />
                    <span>Delete</span>
                  </button>
                </>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionMenu;