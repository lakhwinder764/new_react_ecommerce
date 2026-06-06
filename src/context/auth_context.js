import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  authApi,
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getStoredAuth,
  saveAuth,
} from '../api/authApi';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((access, refresh, nextUser) => {
    saveAuth({ access, refresh, user: nextUser });
    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshSession = useCallback(async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      logout();
      return null;
    }

    try {
      const data = await authApi.refresh(refresh);
      const stored = getStoredAuth();
      const access = data.access;
      const nextUser = stored?.user ?? (await authApi.me(access));
      applySession(access, data.refresh ?? refresh, nextUser);
      return access;
    } catch {
      logout();
      return null;
    }
  }, [applySession, logout]);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredAuth();
      if (!stored?.access) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.me(stored.access);
        applySession(stored.access, stored.refresh, profile);
      } catch {
        await refreshSession();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [applySession, refreshSession]);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      applySession(data.access, data.refresh, data.user);
      return data.user;
    },
    [applySession]
  );

  const registerAndLogin = useCallback(
    async (payload) => {
      await authApi.register(payload);
      const data = await authApi.login(payload.email, payload.password);
      applySession(data.access, data.refresh, data.user);
      return data.user;
    },
    [applySession]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register: registerAndLogin,
      logout,
      getAccessToken,
      refreshSession,
    }),
    [user, isAuthenticated, isLoading, login, registerAndLogin, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
