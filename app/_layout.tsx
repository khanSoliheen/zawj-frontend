import { Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ITheme } from '@/constants/types';
import '@/i18n';
import { ToastProvider } from '@/hooks/toaster';
import { DataProvider, useData } from '@/hooks/useData';
import { AuthProvider, useAuth } from '@/hooks/userContext';
import { ThemeProvider } from '@/hooks/useTheme';
import { getNavigationRedirect } from '@/utils/navigation';

const NavigationGate = () => {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    const redirect = getNavigationRedirect({
      currentUser,
      isLoading,
      rootNavigationKey: rootNavigationState?.key,
      segments,
    });

    if (redirect) {
      router.replace(redirect);
    }
  }, [currentUser, isLoading, rootNavigationState?.key, router, segments]);

  if (isLoading) {
    return null;
  }

  return <Slot />;
};

const AppContainer = () => {
  const { theme, setTheme } = useData();

  const handleThemeChange = useCallback(
    (nextTheme?: ITheme) => {
      if (nextTheme) {
        setTheme(nextTheme);
      }
    },
    [setTheme],
  );

  return (
    <ThemeProvider theme={theme} setTheme={handleThemeChange}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationGate />
      </SafeAreaView>
    </ThemeProvider>
  );
};

export default function Layout() {
  return (
    <DataProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContainer />
        </ToastProvider>
      </AuthProvider>
    </DataProvider>
  );
}
