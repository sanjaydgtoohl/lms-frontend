import React from 'react';
import { Plus, User, LogOut, Settings, UserRound, LifeBuoy, ChevronDown } from 'lucide-react';
import ApiErrorNotification from '../ui/ApiErrorNotification';
import { Button } from '../ui';
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
        {/* Left side intentionally left blank (removed Dashboard title) */}
        <div />

        <div className="flex items-center gap-3 sm:gap-4">
          {/* API Error Notification Icon */}
          <ApiErrorNotification />
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="transparent"
              type="button"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="group flex items-center gap-2 px-2 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
                <span className="text-sm font-medium text-current">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </span>
                <span className="text-xs text-current/70">{user?.role ?? 'Member'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

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
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-gray-700"
                  >
                    <UserRound className="w-4 h-4 text-gray-500" />
                    Profile
                  </Button>
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-gray-700"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    Settings
                  </Button>
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-gray-700"
                  >
                    <LifeBuoy className="w-4 h-4 text-gray-500" />
                    Support
                  </Button>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-red-600"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    Logout
                  </Button>
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
