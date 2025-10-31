import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Eye, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionMenuProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  /** If true, forces the menu to open above the trigger (used for last rows) */
  isLast?: boolean;
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
      // If consumer passed explicit prop, respect it
      if (typeof isLast === 'boolean') {
        setShowAbove(isLast);
        return;
      }

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If there is very little space below the element, show above instead
        setShowAbove(spaceBelow < 150);
      }
    };

    checkPosition();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', checkPosition);
    window.addEventListener('resize', checkPosition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, [isOpen, isLast]);

  return (
    <div className="relative" ref={containerRef}>
      <style>{`
        .action-menu-container .action-btn {
          background-color: white !important;
        }
        .action-menu-container .action-btn:hover {
          background-color: white !important;
        }
      `}</style>

      <div className="relative action-menu-container">
        <button
          ref={toggleRef}
          onClick={() => setIsOpen((v) => !v)}
          className="action-btn p-2 text-[var(--text-secondary)] hover:text-blue-500 transition-all duration-200"
          title="Actions"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: showAbove ? 8 : -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: showAbove ? 8 : -8, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              role="menu"
              className={`absolute right-0 ${showAbove ? 'bottom-full mb-2' : 'top-full mt-2'} mr-1 bg-white rounded-md shadow-sm border border-[var(--border-color)] py-1 min-w-[140px] z-50`}
            >
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="action-btn w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:text-blue-500 hover:bg-gray-50 flex items-center space-x-3 rounded-md"
                  role="menuitem"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}

              {onView && (
                <button
                  onClick={() => {
                    onView();
                    setIsOpen(false);
                  }}
                  className="action-btn w-full px-3 py-2 text-sm text-[var(--text-primary)] hover:text-blue-500 hover:bg-gray-50 flex items-center space-x-3 rounded-md"
                  role="menuitem"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => {
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="action-btn w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-gray-50 flex items-center space-x-3 rounded-md"
                  role="menuitem"
                >
                  <Trash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActionMenu;