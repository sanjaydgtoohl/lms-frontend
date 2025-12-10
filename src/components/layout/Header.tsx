import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, LogOut, Settings, UserRound, LifeBuoy, ChevronDown, Menu } from 'lucide-react';
import ApiErrorNotification from '../ui/ApiErrorNotification';
import { Button } from '../ui';
import { fetchCurrentUser } from '../../services/Header';

interface HeaderProps {
  onCreateClick?: () => void;
  createButtonText?: string;
  showHamburger?: boolean;
  onHamburgerClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onCreateClick,
  createButtonText = "Create Source",
  showHamburger,
  onHamburgerClick,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const [userName, setUserName] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    async function getUser() {
      const user = await fetchCurrentUser();
      setUserName(user?.name ?? '');
    }
    getUser();
  }, []);

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
    // TODO: Implement logout logic if needed
    window.location.href = '/login';
  };

  return (
  <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center justify-between px-3 md:px-4 sm:px-6 py-3" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        {/* Left: show hamburger on mobile only */}
        <div className="flex items-center">
          {showHamburger && (
            <button
              onClick={onHamburgerClick}
              aria-label="Open menu"
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#344054] md:hidden"
            >
              <Menu className="w-5 h-5 text-[#344054]" />
            </button>
          )}
        </div>

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
              className="group flex items-center gap-2 px-2 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#344054]"
            >
              <div className="w-8 h-8 bg-[#344054] rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
                <span className="text-sm font-medium text-[#344054]">
                  {userName}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isUserMenuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="px-4 py-4 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg">
                      {userName ? userName[0].toUpperCase() : ''}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-gray-900 truncate">{userName}</p>
                      <p className="text-sm text-gray-500 truncate"></p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-gray-800 hover:bg-gray-50"
                  >
                    <UserRound className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Profile</span>
                  </Button>
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-gray-800 hover:bg-gray-50"
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Settings</span>
                  </Button>
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-gray-800 hover:bg-gray-50"
                  >
                    <LifeBuoy className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Support</span>
                  </Button>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <Button
                    role="menuitem"
                    variant="transparent"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-red-600 hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="text-red-600">Logout</span>
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
