import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { registerDeviceForPush, unregisterDevicePushToken } from '@/hooks/usePushNotifications';
import BillingService, { type BillingStatus } from '@/services/billing';
import SessionService, {
  type SessionUser,
  type SignInCredentials,
  type SignOutScope,
} from '@/services/session';

const AuthContext = createContext<{
  currentUser: SessionUser | null;
  billingStatus: BillingStatus | null;
  isLoading: boolean;
  setCurrentUser: (user: SessionUser | null) => void;
  refreshBillingStatus: () => Promise<void>;
  login: (credentials: SignInCredentials) => Promise<SessionUser | null>;
  logout: (scope?: SignOutScope) => Promise<void>;
}>({
  currentUser: null,
  billingStatus: null,
  isLoading: true,
  setCurrentUser: () => { },
  refreshBillingStatus: async () => { },
  login: async () => null,
  logout: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);

  const refreshBillingStatus = async () => {
    if (!currentUser) {
      setBillingStatus(null);
      return;
    }

    try {
      const status = await BillingService.getStatus();
      setBillingStatus(status);
    } catch {
      setBillingStatus(null);
    }
  };

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
    void refreshBillingStatus();
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
    if (!user) {
      setBillingStatus(null);
    }
    return user;
  };

  const logout = async (scope: SignOutScope = 'local') => {
    await SessionService.signOut(scope);

    if (scope !== 'others') {
      setCurrentUser(null);
      setBillingStatus(null);
    }
  };

  const value = useMemo(() => ({
    currentUser,
    billingStatus,
    isLoading,
    setCurrentUser,
    refreshBillingStatus,
    login,
    logout,
  }), [billingStatus, currentUser, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
