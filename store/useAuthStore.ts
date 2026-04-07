import { create } from 'zustand';

interface AuthState {
  hasProfile: boolean | null;
  setHasProfile: (val: boolean | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  hasProfile: null,
  setHasProfile: (val) => set({ hasProfile: val }),
}));
