import { useCallback, useState } from 'react';

export interface UseDeleteConfirmResult {
  confirmDeleteId: string | null;
  confirmLoading: boolean;
  isConfirmOpen: boolean;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
}

export function useDeleteConfirm(
  onDelete: (id: string) => Promise<void>
): UseDeleteConfirmResult {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const requestDelete = useCallback((id: string) => {
    setConfirmDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    if (!confirmLoading) setConfirmDeleteId(null);
  }, [confirmLoading]);

  const confirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmDeleteId, onDelete]);

  return {
    confirmDeleteId,
    confirmLoading,
    isConfirmOpen: !!confirmDeleteId,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
