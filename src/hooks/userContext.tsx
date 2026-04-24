import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { registerDeviceForPush, unregisterDevicePushToken } from '@/hooks/usePushNotifications';
import SessionService, {
  type SessionUser,
  type SignInCredentials,
  type SignOutScope,
} from '@/services/session';

const AuthContext = createContext<{
  currentUser: SessionUser | null;
  isLoading: boolean;
  setCurrentUser: (user: SessionUser | null) => void;
  login: (credentials: SignInCredentials) => Promise<SessionUser | null>;
  logout: (scope?: SignOutScope) => Promise<void>;
}>({
  currentUser: null,
  isLoading: true,
  setCurrentUser: () => {},
  login: async () => null,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async () => {
      try {
        const user = await SessionService.getCurrentUser();
        if (isMounted) {
          setCurrentUser(user);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void hydrateUser();

    const unsubscribe = SessionService.onAuthStateChange((user) => {
      if (!isMounted) {
        return;
      }

      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!currentUser) {
      return undefined;
    }

    void (async () => {
      try {
        const token = await registerDeviceForPush();
        if (!cancelled) {
          setPushToken(token);
        }
      } catch {
        if (!cancelled) {
          setPushToken(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser || !pushToken) {
      return undefined;
    }

    void unregisterDevicePushToken(pushToken).catch(() => undefined);
    setPushToken(null);
    return undefined;
  }, [currentUser, pushToken]);

  const login = async (credentials: SignInCredentials) => {
    const user = await SessionService.signIn(credentials);
    setCurrentUser(user);
    return user;
  };

  const logout = async (scope: SignOutScope = 'local') => {
    await SessionService.signOut(scope);

    if (scope !== 'others') {
      setCurrentUser(null);
    }
  };

  const value = useMemo(() => ({
    currentUser,
    isLoading,
    setCurrentUser,
    login,
    logout,
  }), [currentUser, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
