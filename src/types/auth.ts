import type { User } from "./index";

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshTokenValue: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
