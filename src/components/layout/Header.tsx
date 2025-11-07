import React from 'react';
import { Plus, User, LogOut, Settings, UserRound, LifeBuoy, ChevronDown } from 'lucide-react';
import ApiErrorNotification from '../ui/ApiErrorNotification';
import { useAuthStore } from '../../store/auth';

interface HeaderProps {
  onCreateClick?: () => void;
  createButtonText?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onCreateClick, 
  createButtonText = "Create Source" 
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuthStore();

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (e) {
      // noop
    }
  };

  return (
  <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-wide">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* API Error Notification Icon */}
          <ApiErrorNotification />
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="group flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-[var(--hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
                <span className="text-sm font-medium text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </span>
                <span className="text-xs text-gray-500">{user?.role ?? 'Member'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user ? `${user.firstName} ${user.lastName}` : 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[var(--hover-bg)]"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserRound className="w-4 h-4 text-gray-500" />
                    Profile
                  </button>
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[var(--hover-bg)]"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    Settings
                  </button>
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[var(--hover-bg)]"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <LifeBuoy className="w-4 h-4 text-gray-500" />
                    Support
                  </button>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create Button */}
          {onCreateClick && createButtonText && (
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-4 py-2 btn-primary text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>{createButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
