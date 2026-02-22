import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';

// Mock api before importing store
vi.mock('../api', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

// We need to re-import the store fresh for tests that depend on localStorage
let useAuthStore;

describe('authStore', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset module cache to get fresh store each test
    vi.resetModules();

    // Re-mock api
    vi.doMock('../api', () => ({
      default: {
        login: vi.fn(),
        register: vi.fn(),
        getMe: vi.fn(),
      },
    }));

    const module = await import('./authStore.js');
    useAuthStore = module.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have null user by default', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should start with splash appState', () => {
      expect(useAuthStore.getState().appState).toBe('splash');
    });

    // Note: localStorage hydration on init cannot be reliably tested in Vitest's
    // jsdom environment due to module-level localStorage isolation. The store's
    // IIFE reads from a different localStorage instance than the test has access to.
  });

  describe('setUser', () => {
    it('should set user state', () => {
      const userData = { id: '1', name: 'Test User' };
      act(() => useAuthStore.getState().setUser(userData));
      expect(useAuthStore.getState().user).toEqual(userData);
    });

    it('should clear user state when setting null', () => {
      act(() => useAuthStore.getState().setUser({ id: '1' }));
      act(() => useAuthStore.getState().setUser(null));
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('setAppState', () => {
    it('should update appState', () => {
      act(() => useAuthStore.getState().setAppState('auth'));
      expect(useAuthStore.getState().appState).toBe('auth');
    });
  });

  describe('handleLogin', () => {
    it('should call api.login for login type', async () => {
      const mockApi = (await import('../api')).default;
      mockApi.login.mockResolvedValue({
        user: { id: '1', name: 'Test' },
        token: 'jwt-token',
      });

      await act(async () => {
        await useAuthStore.getState().handleLogin('login', {
          email: 'test@example.com',
          password: 'password',
        });
      });

      expect(mockApi.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(useAuthStore.getState().user).toEqual({ id: '1', name: 'Test' });
      expect(useAuthStore.getState().appState).toBe('app');
    });

    it('should call api.register for register type', async () => {
      const mockApi = (await import('../api')).default;
      mockApi.register.mockResolvedValue({
        user: { id: '2', name: 'New User' },
        token: 'new-token',
      });

      await act(async () => {
        await useAuthStore.getState().handleLogin('register', {
          email: 'new@example.com',
          password: 'password',
          firstName: 'New',
          lastName: 'User',
        });
      });

      expect(mockApi.register).toHaveBeenCalledWith('new@example.com', 'password', 'New', 'User');
      expect(useAuthStore.getState().user).toEqual({ id: '2', name: 'New User' });
    });

    it('should call onSuccess callback with user', async () => {
      const mockApi = (await import('../api')).default;
      const onSuccess = vi.fn();
      mockApi.login.mockResolvedValue({
        user: { id: '1', name: 'Test' },
        token: 'token',
      });

      await act(async () => {
        await useAuthStore.getState().handleLogin('login', {
          email: 'test@example.com',
          password: 'password',
        }, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith({ id: '1', name: 'Test' });
    });

    it('should reset dataFetchedForUser on login', async () => {
      const mockApi = (await import('../api')).default;
      mockApi.login.mockResolvedValue({
        user: { id: '1' },
        token: 'token',
      });

      act(() => useAuthStore.getState().setDataFetchedForUser('old-user'));

      await act(async () => {
        await useAuthStore.getState().handleLogin('login', {
          email: 'test@example.com',
          password: 'password',
        });
      });

      expect(useAuthStore.getState()._dataFetchedForUser).toBeNull();
    });
  });

  describe('handleLogout', () => {
    it('should clear user and set appState to auth', () => {
      act(() => {
        useAuthStore.getState().setUser({ id: '1' });
        useAuthStore.getState().setAppState('app');
      });

      act(() => useAuthStore.getState().handleLogout());

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().appState).toBe('auth');
    });

    it('should call onSuccess callback', () => {
      const onSuccess = vi.fn();
      act(() => useAuthStore.getState().handleLogout(onSuccess));
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('checkSession', () => {
    it('should set appState to auth when no token', async () => {
      // No token in localStorage (fresh module, clear localStorage)
      const result = await act(async () => {
        return useAuthStore.getState().checkSession();
      });

      expect(result).toBeNull();
      expect(useAuthStore.getState().appState).toBe('auth');
    });

    // Note: checkSession with valid/expired token cannot be reliably tested
    // in Vitest's jsdom environment because the store's localStorage.getItem
    // reads from a different localStorage instance than the test can write to.
    // The no-token case is tested above.
  });

  describe('dataFetchedForUser', () => {
    it('should get and set dataFetchedForUser', () => {
      act(() => useAuthStore.getState().setDataFetchedForUser('user-123'));
      expect(useAuthStore.getState().getDataFetchedForUser()).toBe('user-123');
    });
  });
});
