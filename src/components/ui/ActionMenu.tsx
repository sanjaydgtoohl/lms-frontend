import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Eye, Trash } from 'lucide-react';
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

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onView, onDelete, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    const checkPosition = () => {
      if (!isOpen || !containerRef.current) return;

      // If consumer passed explicit prop, respect it for last row
      if (typeof isLast === 'boolean' && isLast) {
        setShowAbove(true);
        return;
      }

      // Check available space dynamically
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 120; // Approximate menu height
      
      // Show above if not enough space below but enough space above
      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setShowAbove(true);
      } else if (spaceBelow >= menuHeight) {
        setShowAbove(false);
      } else {
        // If not enough space either way, prefer below (will scroll into view)
        setShowAbove(false);
      }
    };

    if (isOpen) {
      checkPosition();
      window.addEventListener('scroll', checkPosition, true);
      window.addEventListener('resize', checkPosition);
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', checkPosition, true);
      window.removeEventListener('resize', checkPosition);
    };
  }, [isOpen, isLast]);

  return (
    <div className="relative inline-flex z-10" ref={containerRef}>
      {/* Toggle Button */}
      <button
        ref={toggleRef}
        onClick={() => setIsOpen((v) => !v)}
        className={`
          inline-flex items-center justify-center 
          w-8 h-8 rounded-md
          text-gray-500 hover:text-gray-700 hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          transition-all duration-200 ease-in-out
          ${isOpen ? 'bg-gray-100 text-gray-700' : ''}
        `}
        title="Actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open actions menu"
      >
        <MoreVertical className="w-4 h-4" />
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
                  className="
                    w-full px-4 py-2.5 text-sm font-medium
                    text-gray-700 hover:text-blue-600 hover:bg-blue-50
                    flex items-center gap-3
                    transition-colors duration-150 ease-in-out
                    first:rounded-t-lg last:rounded-b-lg
                    focus:outline-none focus:bg-blue-50 focus:text-blue-600
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
                  className="
                    w-full px-4 py-2.5 text-sm font-medium
                    text-gray-700 hover:text-blue-600 hover:bg-blue-50
                    flex items-center gap-3
                    transition-colors duration-150 ease-in-out
                    first:rounded-t-lg last:rounded-b-lg
                    focus:outline-none focus:bg-blue-50 focus:text-blue-600
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
                    className="
                      w-full px-4 py-2.5 text-sm font-medium
                      text-red-600 hover:text-red-700 hover:bg-red-50
                      flex items-center gap-3
                      transition-colors duration-150 ease-in-out
                      first:rounded-t-lg last:rounded-b-lg
                      focus:outline-none focus:bg-red-50 focus:text-red-700
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