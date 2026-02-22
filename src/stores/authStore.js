import { create } from 'zustand';
import api from '../api';

const useAuthStore = create((set, get) => ({
  // State
  user: (() => {
    const jsonValue = localStorage.getItem('socialise_user');
    if (jsonValue != null) {
      try {
        return JSON.parse(jsonValue);
      } catch {
        localStorage.removeItem('socialise_user');
      }
    }
    return null;
  })(),
  appState: 'splash',
  _dataFetchedForUser: null,

  // Actions
  setUser: (userData) => {
    set({ user: userData });
    if (userData) {
      localStorage.setItem('socialise_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('socialise_user');
    }
  },

  setAppState: (state) => set({ appState: state }),

  getDataFetchedForUser: () => get()._dataFetchedForUser,
  setDataFetchedForUser: (userId) => set({ _dataFetchedForUser: userId }),

  handleLogin: async (type, credentials, { onSuccess } = {}) => {
    let response;
    if (type === 'register') {
      // Clean slate for new user — clear any stale data from previous session
      const { default: useUIStore } = await import('./uiStore');
      const { default: useCommunityStore } = await import('./communityStore');
      useUIStore.getState().resetUserData();
      useCommunityStore.getState().resetUserTribes();

      response = await api.register(
        credentials.email,
        credentials.password,
        credentials.firstName,
        credentials.lastName
      );
    } else {
      response = await api.login(credentials.email, credentials.password);
    }

    const { setUser, setAppState } = get();
    setUser(response.user);
    localStorage.setItem('socialise_token', response.token);
    set({ _dataFetchedForUser: null });
    setAppState('app');

    // Sync login streak from server to UI store
    if (response.user?.loginStreak != null) {
      const { default: useUIStore } = await import('./uiStore');
      useUIStore.getState().setLoginStreak(response.user.loginStreak);
    }

    if (onSuccess) {
      onSuccess(response.user);
    }

    return response;
  },

  handleLogout: (onSuccess) => {
    const { setUser } = get();
    setUser(null);
    localStorage.removeItem('socialise_token');
    set({ _dataFetchedForUser: null, appState: 'auth' });

    if (onSuccess) {
      onSuccess();
    }
  },

  checkSession: async () => {
    const token = localStorage.getItem('socialise_token');
    if (!token) {
      set({ appState: 'auth' });
      return null;
    }

    try {
      const userData = await api.getMe(token);
      const { setUser } = get();
      setUser(userData);
      set({ appState: 'app', _dataFetchedForUser: null });

      // Sync login streak from server to UI store
      if (userData?.loginStreak != null) {
        const { default: useUIStore } = await import('./uiStore');
        useUIStore.getState().setLoginStreak(userData.loginStreak);
      }

      return userData;
    } catch (err) {
      console.error('Session check failed:', err);
      const { setUser } = get();
      setUser(null);
      localStorage.removeItem('socialise_token');
      set({ appState: 'auth' });
      return null;
    }
  },
}));

export default useAuthStore;
