import { useState, useCallback, useRef } from 'react';
import api from '../api';

/**
 * Custom hook to manage authentication state and handlers
 * Extracts auth-related state and logic from App.jsx
 */
export function useAuthState() {
  // Core auth state
  const [user, setUser] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_user');
    if (jsonValue != null) {
      try {
        return JSON.parse(jsonValue);
      } catch {
        localStorage.removeItem('socialise_user');
      }
    }
    return null;
  });

  const [appState, setAppState] = useState('splash');

  // Ref to track which user's data has been fetched
  const dataFetchedForUser = useRef(null);

  // Persist user to localStorage
  const persistUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('socialise_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('socialise_user');
    }
  }, []);

  // Handle login - both register and login flows
  const handleLogin = useCallback(async (type, credentials, { onSuccess }) => {
    let response;
    if (type === 'register') {
      response = await api.register(
        credentials.email,
        credentials.password,
        credentials.firstName,
        credentials.lastName
      );
    } else {
      response = await api.login(credentials.email, credentials.password);
    }

    persistUser(response.user);
    localStorage.setItem('socialise_token', response.token);
    dataFetchedForUser.current = null;

    // Notify app to transition to app state
    setAppState('app');

    // Call success callback with user info
    if (onSuccess) {
      onSuccess(response.user);
    }

    return response;
  }, [persistUser]);

  // Handle logout
  const handleLogout = useCallback((onSuccess) => {
    persistUser(null);
    localStorage.removeItem('socialise_token');
    dataFetchedForUser.current = null;
    setAppState('auth');

    if (onSuccess) {
      onSuccess();
    }
  }, [persistUser]);

  // Check session on app mount (called from App.jsx useEffect)
  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('socialise_token');
    if (!token) {
      setAppState('auth');
      return null;
    }

    try {
      const userData = await api.getMe(token);
      persistUser(userData);
      setAppState('app');
      dataFetchedForUser.current = null;
      return userData;
    } catch (err) {
      console.error('Session check failed:', err);
      persistUser(null);
      localStorage.removeItem('socialise_token');
      setAppState('auth');
      return null;
    }
  }, [persistUser]);

  return {
    // State
    user,
    appState,
    dataFetchedForUser,

    // Handlers
    handleLogin,
    handleLogout,
    checkSession,
    setAppState,
    setUser: persistUser,
  };
}
