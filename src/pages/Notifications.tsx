import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Clock3, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui';
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markCategoryRead,
  markNotificationRead,
} from '../services/notifications';
import type { NotificationCategory, NotificationItem, NotificationTab } from '../services/notifications';

const CATEGORY_OPTIONS: Array<{ key: NotificationCategory; label: string }> = [
  { key: 'Lead Created', label: 'Lead Created' },
  { key: 'Pre Lead Created', label: 'Pre Lead Created' },
  { key: 'Brief Created', label: 'Brief Created' },
  { key: 'Assignment Updated', label: 'Assignment Updated' },
  { key: 'Status Updated', label: 'Status Updated' },
  { key: 'System', label: 'System' },
];

const TAB_OPTIONS: Array<{ key: NotificationTab; label: string; categories?: NotificationCategory[] }> = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  {
    key: 'lead-management',
    label: 'Lead Management',
    categories: ['Lead Created', 'Assignment Updated']
  },
  {
    key: 'brief',
    label: 'Brief',
    categories: ['Brief Created', 'Status Updated', 'Assignment Updated']
  },
  {
    key: 'pre-lead',
    label: 'Pre Lead',
    categories: ['Pre Lead Created']
  },
  { key: 'system', label: 'System', categories: ['System'] },
];

const ITEMS_PER_PAGE = 10;

const formatTimeAgo = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString();
};

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [selectedCategories, setSelectedCategories] = useState<NotificationCategory[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const activeCategoryLabels = selectedCategories.map((item) => item.toString()).join(', ');

  const fetchUnreadCount = async () => {
    setLoadingCount(true);
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    } finally {
      setLoadingCount(false);
    }
  };

  const loadNotifications = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      let effectiveTab = activeTab;
      let effectiveCategories = selectedCategories;

      if (showUnreadOnly && activeTab !== 'unread') {
        effectiveTab = 'unread';
      }

      const response = await listNotifications(page, ITEMS_PER_PAGE, effectiveTab, effectiveCategories);
      const items = response.data || [];
      setNotifications((prev) => (append ? [...prev, ...items] : items));
      setCurrentPage(page);
      const total = response.meta?.pagination?.total ?? items.length;
      setTotalItems(total);
    } catch (err) {
      console.error(err);
      setError('Unable to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategories, showUnreadOnly]);

  useEffect(() => {
    fetchUnreadCount();
  }, [refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
    loadNotifications(1, false);
  }, [activeTab, selectedCategories, refreshKey, showUnreadOnly, loadNotifications]);

  const handleTabChange = (tabKey: NotificationTab) => {
    setShowUnreadOnly(false);
    setActiveTab(tabKey);
    // When switching to module tabs, auto-select relevant categories
    const tabConfig = TAB_OPTIONS.find(tab => tab.key === tabKey);
    if (tabConfig?.categories) {
      setSelectedCategories(tabConfig.categories);
    } else if (tabKey === 'all' || tabKey === 'unread' || tabKey === 'system') {
      // For general tabs, clear category filters
      setSelectedCategories([]);
    }
  };

  const handleUnreadFilterChange = () => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  const handleToggleCategory = (category: NotificationCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    await loadNotifications(nextPage, true);
  };

  const handleMarkAllRead = async () => {
    setIsMarking(true);
    try {
      await markAllNotificationsRead();
      setRefreshKey((key) => key + 1);
      setShowUnreadOnly(false);
    } catch (err) {
      console.error(err);
      setError('Failed to mark all notifications read.');
    } finally {
      setIsMarking(false);
    }
  };

  const handleMarkCategoryRead = async (category: NotificationCategory) => {
    setIsMarking(true);
    try {
      await markCategoryRead(category);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      console.error(err);
      setError('Failed to mark category read.');
    } finally {
      setIsMarking(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    setIsMarking(true);
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
      setError('Failed to mark notification read.');
    } finally {
      setIsMarking(false);
    }
  };

  const unreadInView = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const hasMore = useMemo(() => {
    return notifications.length < totalItems;
  }, [notifications.length, totalItems]);

  const onViewAll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <Bell className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-semibold">Notifications</h1>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {loadingCount ? 'Loading unread count…' : `Unread notifications: ${unreadCount}`}
            {selectedCategories.length > 0 && (
              <span className="ml-2">
                · Filtered by: {activeCategoryLabels}
                {['lead-management', 'brief', 'pre-lead', 'system'].includes(activeTab) && ' (Auto-filtered by module)'}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarking || unreadCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
          {selectedCategories.length === 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkCategoryRead(selectedCategories[0])}
              disabled={isMarking}
              className="text-gray-700 border border-gray-200"
            >
              Mark {selectedCategories[0]} read
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={handleUnreadFilterChange}
              className="w-4 h-4 text-blue-600 bg-white border border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Show Unread Only</span>
          </label>
          <button
            onClick={handleMarkAllRead}
            disabled={isMarking || unreadCount === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab.key === activeTab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORY_OPTIONS.map((option) => {
            const isModuleTab = ['lead-management', 'brief', 'pre-lead', 'system'].includes(activeTab);
            const tabConfig = TAB_OPTIONS.find(tab => tab.key === activeTab);
            const isAutoSelected = tabConfig?.categories?.includes(option.key) || false;
            const isManuallySelected = selectedCategories.includes(option.key);
            const isActive = isAutoSelected || (isManuallySelected && !isModuleTab);

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => !isModuleTab && handleToggleCategory(option.key)}
                disabled={isModuleTab}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? isAutoSelected
                      ? 'border-blue-500 bg-blue-100 text-blue-700 cursor-not-allowed'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                } ${isModuleTab ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                {option.label}
                {isAutoSelected && <span className="ml-1 text-xs">(Auto)</span>}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Loading notifications…
            </div>
          ) : !notifications.length ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              No notifications match this view yet.
            </div>
          ) : (
            notifications.map((notification) => {
              // Extract additional data from the original payload if available
              const originalData = (notification as any).originalData;
              const briefData = originalData?.data;

              return (
                <div
                  key={notification.id}
                  className={`rounded-3xl border p-4 transition ${notification.read ? 'border-gray-200 bg-white' : 'border-blue-300 bg-blue-50 shadow-sm'}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                          <Clock3 className="w-3.5 h-3.5" />
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-gray-600 border border-gray-200">
                          {notification.category}
                        </span>
                        {!notification.read && (
                          <span className="rounded-full bg-blue-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Unread</span>
                        )}
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900 mb-2">{notification.title}</h2>

                      <p className="text-sm leading-6 text-gray-600 whitespace-pre-wrap mb-3">{notification.message}</p>

                      {/* Display brief-specific details */}
                      {briefData && briefData.brief_id && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Brief:</span>
                              <span className="ml-2 text-gray-600">#{briefData.brief_id} - {briefData.brief_name}</span>
                            </div>
                            {briefData.previous_status && briefData.new_status && (
                              <div>
                                <span className="font-medium text-gray-700">Status Change:</span>
                                <span className="ml-2 text-gray-600">
                                  {briefData.previous_status} → {briefData.new_status}
                                </span>
                              </div>
                            )}
                            {briefData.updated_by && (
                              <div className="sm:col-span-2">
                                <span className="font-medium text-gray-700">Updated by:</span>
                                <span className="ml-2 text-gray-600">{briefData.updated_by}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {notification.source && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                          <ArrowRight className="w-3.5 h-3.5" />
                          {notification.source}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant={notification.read ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={notification.read || isMarking}
                      >
                        {notification.read ? 'Read' : 'Mark Read'}
                      </Button>
                      {notification.link && (
                        <a
                          href={notification.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                        >
                          Open
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {notifications.length > 0 && (
              <>
                Showing {notifications.length} of {totalItems} notifications · {unreadInView} unread in this view
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={loading}
              >
                Load More
              </Button>
            )}
            {!hasMore && totalItems > ITEMS_PER_PAGE && (
              <button
                type="button"
                onClick={onViewAll}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                View All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
