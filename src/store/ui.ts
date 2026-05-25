import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  showNotification,
  hideNotification,
  pushError,
  clearErrors,
  type NotificationType,
} from "../redux/slices/uiSlice";
import { store } from "../redux/store";

type UiStoreState = RootState["ui"];

type UiStoreWithActions = UiStoreState & {
  showNotification: (message: string, type?: NotificationType, title?: string) => void;
  hideNotification: () => void;
  pushError: (message: string) => void;
  clearErrors: () => void;
};

const uiStoreApi = {
  showNotification: (message: string, type: NotificationType = "info", title?: string) => {
    store.dispatch(showNotification({ message, type, title }));
  },
  hideNotification: () => {
    store.dispatch(hideNotification());
  },
  pushError: (message: string) => {
    store.dispatch(pushError(message));
  },
  clearErrors: () => {
    store.dispatch(clearErrors());
  },
};

export function useUiStore<T>(selector: (state: UiStoreState) => T): T {
  return useSelector((state: RootState) => selector(state.ui));
}

useUiStore.getState = (): UiStoreWithActions => ({
  ...store.getState().ui,
  ...uiStoreApi,
});

Object.assign(useUiStore, uiStoreApi);

export function useUiActions() {
  const dispatch = useDispatch<AppDispatch>();

  return {
    showNotification: useCallback(
      (message: string, type: NotificationType = "info", title?: string) => {
        dispatch(showNotification({ message, type, title }));
      },
      [dispatch]
    ),
    hideNotification: useCallback(() => {
      dispatch(hideNotification());
    }, [dispatch]),
    pushError: useCallback(
      (message: string) => {
        dispatch(pushError(message));
      },
      [dispatch]
    ),
    clearErrors: useCallback(() => {
      dispatch(clearErrors());
    }, [dispatch]),
  };
}

export type { NotificationType };
export default useUiStore;
