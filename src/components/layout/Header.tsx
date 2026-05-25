import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, LogOut, UserRound, Menu, PanelLeft, PanelLeftClose, Check } from 'lucide-react';
import { Button } from '../ui';
import ThemeToggle from './ThemeToggle';
import { fetchCurrentUser } from '../../services/Header';
import {
  clearAllNotifications,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notifications';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { logoutUser } from '../../redux/slices/authSlice';
import { setUnreadCount } from '../../redux/slices/notificationSlice';
import type { NotificationItem, NotificationTab } from '../../services/notifications';
import { ROUTES } from '../../constants';

interface HeaderProps {
  onCreateClick?: () => void;
  createButtonText?: string;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
  isMobileLayout?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onCreateClick,
  createButtonText = 'Create Source',
  onSidebarToggle,
  sidebarCollapsed = false,
  isMobileLayout = false,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<{ name?: string; email?: string; roles?: { id: string; name?: string; display_name?: string }[] } | null>(null);
  const allNotifications = useSelector((state: RootState) => state.notifications.all);
  const reduxUnreadCount = allNotifications?.unreadCount || 0;
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeDropdownTab] = useState<NotificationTab>('all');
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const notificationDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const notificationButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function getUser() {
      const u = await fetchCurrentUser();
      setUser(u ?? null);
    }
    getUser();
  }, []);

  useEffect(() => {
    let active = true;
    async function loadNotificationCount() {
      try {
        const count = await getUnreadNotificationCount();
        if (active) dispatch(setUnreadCount({ module: 'all', count }));
      } catch (error) {
        console.error('Failed to load notification count:', error);
      }
    }
    loadNotificationCount();
    return () => {
      active = false;
    };
  }, [dispatch]);

  const loadRecentNotifications = async (
    tab: NotificationTab = activeDropdownTab,
    unreadOnly: boolean = showUnreadOnly
  ) => {
    try {
      let effectiveTab = tab;
      if (unreadOnly) effectiveTab = 'unread';
      const response = await listNotifications(1, 5, effectiveTab, []);
      let filteredNotifications = response.data || [];
      if (unreadOnly) filteredNotifications = filteredNotifications.filter((n) => !n.read);
      setRecentNotifications(filteredNotifications);
    } catch (error) {
      console.error('Failed to load recent notifications:', error);
    }
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      const targetNode = e.target as Node;
      if (
        !notificationDropdownRef.current?.contains(targetNode) &&
        !notificationButtonRef.current?.contains(targetNode)
      ) {
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
      try {
        await markNotificationRead(notification.id);
        await loadRecentNotifications(activeDropdownTab, showUnreadOnly);
        const unread = await getUnreadNotificationCount();
        dispatch(setUnreadCount({ module: 'all', count: unread }));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : '?';

  return (
    <header className="app-header header-bg">
      <div className="app-header-inner">
        <div className="flex min-w-0 items-center">
          {onSidebarToggle && (
            <button
              type="button"
              onClick={onSidebarToggle}
              className="app-icon-btn app-sidebar-toggle"
              aria-label={
                isMobileLayout
                  ? 'Open menu'
                  : sidebarCollapsed
                    ? 'Expand sidebar'
                    : 'Collapse sidebar'
              }
              title={
                isMobileLayout
                  ? 'Menu'
                  : sidebarCollapsed
                    ? 'Expand sidebar'
                    : 'Collapse sidebar'
              }
            >
              {isMobileLayout ? (
                <Menu className="h-5 w-5 shrink-0" strokeWidth={2} />
              ) : sidebarCollapsed ? (
                <PanelLeft className="h-5 w-5 shrink-0" strokeWidth={2} />
              ) : (
                <PanelLeftClose className="h-5 w-5 shrink-0" strokeWidth={2} />
              )}
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              ref={notificationButtonRef}
              onClick={handleNotificationClick}
              className={`app-icon-btn relative ${isNotificationDropdownOpen ? 'app-icon-btn--accent' : ''}`}
              aria-label="Notifications"
              aria-expanded={isNotificationDropdownOpen}
            >
              <Bell
                className="app-notification-bell h-5 w-5 shrink-0"
                strokeWidth={2}
                aria-hidden
              />
              {reduxUnreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[10px] font-bold text-white">
                  {reduxUnreadCount > 99 ? '99+' : reduxUnreadCount}
                </span>
              )}
            </button>

            {isNotificationDropdownOpen && (
              <div ref={notificationDropdownRef} className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw]">
                <div className="app-dropdown">
                  <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                        Notifications
                        {reduxUnreadCount > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] px-1.5 text-[10px] font-semibold text-[var(--brand-accent)]">
                            {reduxUnreadCount > 99 ? '99+' : reduxUnreadCount}
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                        <input
                          type="checkbox"
                          checked={showUnreadOnly}
                          onChange={handleUnreadFilterChange}
                          className="rounded border-[var(--input-border)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                        />
                        Unread only
                      </label>
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        disabled={isMarkingRead || reduxUnreadCount === 0}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark read
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveAllNotifications}
                        className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 min-h-[7rem] overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
                        No notifications yet
                      </p>
                    ) : (
                      recentNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          className="w-full border-b border-[var(--border-subtle)] px-4 py-3 text-left transition-colors hover:bg-[var(--nav-hover)]"
                          onClick={() => handleNotificationItemClick(notification)}
                        >
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">{notification.message}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)] opacity-80">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                          {!notification.read && (
                            <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[var(--brand-accent)]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] py-1 pl-1 pr-2 transition-colors hover:border-[var(--brand-primary)] sm:pr-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm font-semibold text-white">
                {userInitial}
              </span>
              <span className="hidden max-w-[140px] flex-col items-start leading-tight sm:flex">
                <span className="truncate text-sm font-medium text-[var(--text-primary)]">{user?.name}</span>
                {user?.email && (
                  <span className="truncate text-xs text-[var(--text-secondary)]">{user.email}</span>
                )}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72">
                <div className="app-dropdown" role="menu" aria-label="User menu">
                  <div className="border-b border-[var(--border-subtle)] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-lg font-semibold text-white">
                        {userInitial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[var(--text-primary)]">{user?.name}</p>
                        {user?.email && (
                          <p className="truncate text-sm text-[var(--text-secondary)]">{user.email}</p>
                        )}
                        {Array.isArray(user?.roles) && user.roles.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {user.roles.slice(0, 3).map((r) => (
                              <span
                                key={r.id}
                                className="rounded-full bg-[var(--nav-active-bg)] px-2 py-0.5 text-xs font-medium text-[var(--nav-active-text)]"
                              >
                                {r.display_name || r.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Button
                      role="menuitem"
                      variant="transparent"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate(ROUTES.PROFILE);
                      }}
                      className="w-full justify-start gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--nav-hover)]"
                    >
                      <UserRound className="h-5 w-5 text-[var(--text-secondary)]" />
                      <span className="font-medium">Profile</span>
                    </Button>
                    <Button
                      role="menuitem"
                      variant="transparent"
                      onClick={handleLogout}
                      className="w-full justify-start gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {onCreateClick && createButtonText && (
            <button
              type="button"
              onClick={onCreateClick}
              className="btn-primary hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              <span>{createButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
