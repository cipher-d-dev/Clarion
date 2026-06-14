import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, AuthTokens } from "@clarion/shared";

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  clearAuth: () => void;
  updateTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
      updateTokens: (tokens) => set({ tokens }),
    }),
    {
      name: "clarion-auth",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
