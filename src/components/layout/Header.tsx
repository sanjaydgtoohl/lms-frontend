import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, User, LogOut, Settings, UserRound, LifeBuoy, ChevronDown, Menu } from 'lucide-react';
import { Button } from '../ui';
import { fetchCurrentUser } from '../../services/Header';
import { clearAllNotifications, getUnreadNotificationCount, listNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notifications';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { logoutUser } from '../../redux/slices/authSlice';
import { setUnreadCount } from '../../redux/slices/notificationSlice';
import { FaMoon, FaSun } from 'react-icons/fa';
import type { NotificationItem, NotificationTab } from '../../services/notifications';
import { Check } from 'lucide-react';

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
  const allNotifications = useSelector((state: RootState) => state.notifications.all);
  const reduxUnreadCount = allNotifications?.unreadCount || 0;
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = React.useState(false);
  const [recentNotifications, setRecentNotifications] = React.useState<NotificationItem[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const [activeDropdownTab] = React.useState<NotificationTab>('all');
  const [isMarkingRead, setIsMarkingRead] = React.useState(false);
  const notificationDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const notificationButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    async function getUser() {
      const u = await fetchCurrentUser();
      setUser(u ?? null);
    }
    getUser();
  }, [dispatch]);

  React.useEffect(() => {
    let active = true;
    async function loadNotificationCount() {
      try {
        const count = await getUnreadNotificationCount();
        if (active) {
          dispatch(setUnreadCount({ module: 'all', count }));
        }
      } catch (error) {
        console.error('Failed to load notification count:', error);
      }
    }
    loadNotificationCount();

    return () => {
      active = false;
    };
  }, [dispatch]); // Only load unread count once on mount

  // const getTabCategories = (tab: NotificationTab): NotificationCategory[] => {
  //   const tabConfig = [
  //     { key: 'all', categories: [] },
  //     { key: 'unread', categories: [] },
  //     { key: 'lead-management', categories: ['Lead Created', 'Assignment Updated'] },
  //     { key: 'brief', categories: ['Brief Created', 'Status Updated', 'Assignment Updated'] },
  //     { key: 'pre-lead', categories: ['Pre Lead Created'] },
  //     { key: 'system', categories: ['System'] },
  //   ];
  //   const config = tabConfig.find(c => c.key === tab);
  //   return config?.categories || [];
  // };

  const loadRecentNotifications = async (tab: NotificationTab = activeDropdownTab, unreadOnly: boolean = showUnreadOnly) => {
    try {
      let effectiveTab = tab;
      // let effectiveCategories = getTabCategories(tab); // Commented out category functionality

      if (unreadOnly) {
        effectiveTab = 'unread';
      }

      const response = await listNotifications(1, 5, effectiveTab, []);

      // Frontend-side filtering: if unreadOnly is true, filter to show only unread notifications
      let filteredNotifications = response.data || [];
      if (unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => !n.read);
      }

      setRecentNotifications(filteredNotifications);
    } catch (error) {
      console.error('Failed to load recent notifications:', error);
    }
  };

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }

      const targetNode = e.target as Node;
      const clickedInsideDropdown = notificationDropdownRef.current?.contains(targetNode);
      const clickedBellButton = notificationButtonRef.current?.contains(targetNode);

      if (!clickedInsideDropdown && !clickedBellButton) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleNotificationClick = () => {
    setIsNotificationDropdownOpen((prev) => {
      const next = !prev;
      if (next) {
        // Refresh count and notifications only when opening dropdown
        (async () => {
          try {
            const count = await getUnreadNotificationCount();
            dispatch(setUnreadCount({ module: 'all', count }));
          } catch (error) {
            console.error('Failed to refresh notification count:', error);
          }
        })();
        loadRecentNotifications(activeDropdownTab, showUnreadOnly);
      }
      return next;
    });
  };

  const handleUnreadFilterChange = () => {
    const newUnreadOnly = !showUnreadOnly;
    setShowUnreadOnly(newUnreadOnly);
    loadRecentNotifications(activeDropdownTab, newUnreadOnly);
  };

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    try {
      await markAllNotificationsRead();
      setShowUnreadOnly(false);
      await loadRecentNotifications(activeDropdownTab, false);
      const unread = await getUnreadNotificationCount();
      dispatch(setUnreadCount({ module: 'all', count: unread }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleRemoveAllNotifications = async () => {
    try {
      await clearAllNotifications();
      setRecentNotifications([]);
      setShowUnreadOnly(false);
      const unread = await getUnreadNotificationCount();
      dispatch(setUnreadCount({ module: 'all', count: unread }));
    } catch (error) {
      console.error('Failed to remove all notifications:', error);
    }
  };

  const handleNotificationItemClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      // Mark as read if not already read
      try {
        await markNotificationRead(notification.id);
        // Immediately refresh after marking as read
        await loadRecentNotifications(activeDropdownTab, showUnreadOnly);
        const unread = await getUnreadNotificationCount();
        dispatch(setUnreadCount({ module: 'all', count: unread }));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    // Keep dropdown open for now, let user continue browsing
  };

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
  }, [dispatch]);

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
    <header className="header-bg sticky top-0 z-20 border-b border-gray-200 bg-gray-50 backdrop-blur supports-backdrop-filter:bg-white/70">
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
            className={`relative w-14 h-7 flex items-center rounded-full! p-1 border transition-colors duration-300
          ${dark ? "bg-gray-700! border-gray-700!" : "bg-gray-100! border-gray-200!"}`}
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

          <div className="notification-button relative">
            <button
              type="button"
              ref={notificationButtonRef}
              onClick={handleNotificationClick}
              className="relative inline-flex border-0! outline-0! focus:outline-0 items-center p-2! justify-center rounded-full! text-gray-600 bg-gray-100! focus:outline-none focus:ring-0 aspect-square"
              aria-label="Open notifications"
            >
              <Bell className="text-orange-600" />
              {reduxUnreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1.5 aspect-square text-[10px] font-semibold text-white">
                  {reduxUnreadCount > 99 ? '99+' : reduxUnreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
              <div className="" ref={notificationDropdownRef}>
                {/* <div className="absolute left-0 top-full -mt-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-400 z-60 -mb-2" aria-hidden="true" /> */}

                <div className="fixed left-1/2 -translate-x-1/2 top-full sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-full w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 ring-opacity-5 transition duration-300 ease-in-out">
                  <div className="px-4 py-3 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 flex gap-2 items-center">Notifications
                        {reduxUnreadCount > 0 && (
                          <span className="inline-flex w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 aspect-square text-[10px] font-semibold text-black">
                            {reduxUnreadCount > 99 ? '99+' : reduxUnreadCount}
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap justify-between gap-3">
                      <div className="flex gap-3 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showUnreadOnly}
                            onChange={handleUnreadFilterChange}
                            className="text-gray-800 p-0! bg-white border border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-xs font-medium text-gray-800">Unread</span>
                        </label>

                        <button
                          onClick={handleMarkAllRead}
                          disabled={isMarkingRead || reduxUnreadCount === 0}
                          className="inline-flex items-center gap-1.5 text-xs! font-medium p-0! text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Check className="w-4 h-4" />
                          Mark Read
                        </button>

                      </div>

                      <button
                        onClick={handleRemoveAllNotifications}
                        className="text-xs! font-medium p-0! text-red-800 border-0! transition outline-0! focus:outline-none!"
                      >
                        Remove All
                      </button>
                    </div>

                    {/* Tabs - only show if API has category data */}
                    {/* {hasCategories && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200">
                        {[
                          { key: 'all', label: 'All' }, 
                          { key: 'lead-management', label: 'Lead' },
                          { key: 'brief', label: 'Brief' },
                          { key: 'pre-lead', label: 'Pre Lead' },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => handleDropdownTabChange(tab.key as NotificationTab)}
                            className={`px-3! py-1 leading-none text-sm! rounded-md! outline-none border-0 font-medium transition ${activeDropdownTab === tab.key
                              ? 'bg-gray-800! text-white'
                              : 'bg-gray-200! text-gray-700! hover:text-white! hover:bg-gray-800!'
                              }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    )} */}
                  </div>
                  <div className="min-h-30 max-h-100 overflow-y-auto flex flex-col items-center">
                    {recentNotifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      recentNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 border-b border-gray-100 cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            handleNotificationItemClick(notification);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNotificationItemClick(notification);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

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
                <span className="text-sm font-medium text-gray-800">{user?.name}</span>
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
                      <div className="min-w-14 min-h-14 max-w-14 max-h-14 rounded-full bg-gray-200 border-gray-300 text-gray-800 flex items-center justify-center font-semibold text-lg">
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