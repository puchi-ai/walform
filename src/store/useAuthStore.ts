import { create } from 'zustand';

interface AuthUser {
  id: string;
  address?: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
