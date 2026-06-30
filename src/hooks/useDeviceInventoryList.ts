import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  exportDeviceInventoryExcelFile,
  exportDeviceInventoryPptFile,
  listDeviceInventory,
  type DeviceData,
  type DeviceInventoryFilterParams,
} from '../services/DeviceInventory';

const DEFAULT_PAGE_SIZE = 10;

type UseDeviceInventoryListOptions = {
  pageSize?: number;
  getFilters: () => DeviceInventoryFilterParams;
};

export function useDeviceInventoryList({
  pageSize = DEFAULT_PAGE_SIZE,
  getFilters,
}: UseDeviceInventoryListOptions) {
  const [data, setData] = useState<DeviceData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(totalItems / pageSize);
    return pages > 0 ? pages : 1;
  }, [totalItems, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const isInitialLoad = !hasLoadedRef.current;

    const load = async () => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const res = await listDeviceInventory({
          page: currentPage,
          per_page: pageSize,
          ...getFilters(),
        });

        if (requestId !== requestIdRef.current) return;

        setData(Array.isArray(res.data) ? res.data : []);
        setTotalItems(Number(res.total_records || 0));
        hasLoadedRef.current = true;
      } catch {
        if (requestId !== requestIdRef.current) return;
        setData([]);
        setTotalItems(0);
        hasLoadedRef.current = true;
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    };

    void load();
  }, [currentPage, getFilters, pageSize]);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.min(totalPages, Math.max(1, page)));
    },
    [totalPages]
  );

  const exportExcel = useCallback(async () => {
    await exportDeviceInventoryExcelFile(getFilters());
  }, [getFilters]);

  const exportPpt = useCallback(async () => {
    await exportDeviceInventoryPptFile(getFilters());
  }, [getFilters]);

  return {
    data,
    currentPage,
    totalItems,
    totalPages,
    loading,
    refreshing,
    setCurrentPage: goToPage,
    resetToFirstPage,
    exportExcel,
    exportPpt,
    hasExportableRows: totalItems > 0,
  };
}
