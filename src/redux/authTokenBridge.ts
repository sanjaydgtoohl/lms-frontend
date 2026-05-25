import type { AppDispatch, RootState } from './store';

type StoreRef = {
  getState: () => RootState;
  dispatch: AppDispatch;
};

let storeRef: StoreRef | null = null;

export function injectAuthStore(store: StoreRef): void {
  storeRef = store;
}

function getStore(): StoreRef {
  if (!storeRef) {
    throw new Error('Auth store has not been initialized');
  }
  return storeRef;
}

export function getAccessToken(): string | null {
  return getStore().getState().auth.token;
}

export function getTokenExpiresAt(): number | null {
  return getStore().getState().auth.tokenExpiresAt;
}

export function isAccessTokenValid(): boolean {
  const { token, tokenExpiresAt } = getStore().getState().auth;
  if (!token || !tokenExpiresAt) return false;
  return Date.now() < tokenExpiresAt;
}

export function dispatchAuthAction(action: Parameters<AppDispatch>[0]): void {
  getStore().dispatch(action);
}
