import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, AuthTokens } from "@clarion/shared";

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  clearAuth: () => void;
  updateTokens: (tokens: AuthTokens) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
      updateTokens: (tokens) => set({ tokens }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "clarion-auth",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
