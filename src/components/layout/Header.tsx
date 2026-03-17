import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, LogOut, Settings, UserRound, LifeBuoy, ChevronDown, Menu } from 'lucide-react';
import ApiErrorNotification from '../ui/ApiErrorNotification';
import { Button } from '../ui';
import { fetchCurrentUser } from '../../services/Header';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { logoutUser } from '../../redux/slices/authSlice';
import { FaMoon, FaSun } from 'react-icons/fa';

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
  const [user, setUser] = React.useState<any>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    async function getUser() {
      const u = await fetchCurrentUser();
      setUser(u ?? null);
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

  // ---- Updated logout handler ----
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); // unwrap to throw if rejected
      navigate("/login"); // redirect after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  // --------------------------------



  // dark mode state 
  const [dark, setDark] = useState(false);

  // Load user preference from localStorage (optional)
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!dark);
  };

  return (
    <header className="header-bg sticky top-0 z-20 border-b border-gray-200 bg-gray-50 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center justify-between px-3 md:px-4 sm:px-6 py-3" style={{ paddingTop: '4px', paddingBottom: '4px' }}>

        {/* Left: show hamburger on mobile only */}
        <div className="flex items-center">
          {showHamburger && (
            <div
              onClick={onHamburgerClick}
              aria-label="Open menu"
              role="button"
              tabIndex={0}
              className="cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden focus:outline-none focus:ring-2 focus:ring-[#344054]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onHamburgerClick?.();
                }
              }}
            >
              <Menu className="w-5 h-5 text-gray-800" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 flex items-center !rounded-full p-1 border transition-colors duration-300
          ${dark ? "!bg-gray-700 !border-gray-700" : "!bg-gray-100 !border-gray-200"}`}
          >
            {/* Circle */}
            <span
              className={`absolute left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300
            ${dark ? "translate-x-7" : "translate-x-0"}`}
            ></span>

            {/* Icons */}
            <FaSun
              className={`absolute left-[7.1px] text-yellow-400 text-sm transition-opacity duration-300 ${dark ? "opacity-0" : "opacity-100"
                }`}
            />
            <FaMoon
              className={`absolute right-[5px] text-black text-sm transition-opacity duration-300 ${dark ? "opacity-100" : "opacity-0"
                }`}
            />
          </button>

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
                <span className="text-sm font-medium text-gray-600">{user?.name}</span>
                {user?.email && <span className="text-xs text-gray-500 truncate">{user.email}</span>}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isUserMenuOpen && (
              <div className="relative">
                <div className="absolute right-4 top-0 -mt-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-400 z-60 -mb-2" aria-hidden="true" />
                <div
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 ring-opacity-5 transition duration-300 ease-in-out"
                >
                  <div className="px-4 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg">
                        {user?.name ? user.name[0].toUpperCase() : ''}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate">{user?.name}</p>
                        {user?.email && <p className="text-sm text-gray-500 truncate">{user.email}</p>}
                        {Array.isArray(user?.roles) && user.roles.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {user.roles.slice(0, 3).map((r: any) => (
                              <span key={r.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{r.display_name || r.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <div className="py-1">
                      <Button
                        role="menuitem"
                        variant="transparent"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <UserRound className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Profile</span>
                      </Button>
                      <Button
                        role="menuitem"
                        variant="transparent"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Settings</span>
                      </Button>
                      <Button
                        role="menuitem"
                        variant="transparent"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <LifeBuoy className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Support</span>
                      </Button>
                    </div>

                    <div className="py-1">
                      <Button
                        role="menuitem"
                        variant="transparent"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-base text-red-600 hover:bg-red-50 font-medium focus:outline-none focus:bg-red-50"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="text-red-600">Logout</span>
                      </Button>
                    </div>
                  </div>
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