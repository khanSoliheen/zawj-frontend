import { PROTECTED_SEGMENTS, ROUTES } from '@/constants/routes';
import type { SessionUser } from '@/services/session';

export interface NavigationRedirectInput {
  currentUser: SessionUser | null;
  isLoading: boolean;
  rootNavigationKey?: string;
  segments: string[];
}

export const getNavigationRedirect = ({
  currentUser,
  isLoading,
  rootNavigationKey,
  segments,
}: NavigationRedirectInput) => {
  if (!rootNavigationKey || isLoading) {
    return null;
  }

  const rootSegment = segments[0];
  const inAuthGroup = rootSegment === '(auth)';
  const inUsersListRoute =
    rootSegment === '(tabs)' && segments[1] === 'users' && segments.length === 2;
  const inProtectedTabsRoute = rootSegment === '(tabs)' && !inUsersListRoute;
  const inProtectedGroup =
    (Boolean(rootSegment) && PROTECTED_SEGMENTS.has(rootSegment) && rootSegment !== '(tabs)') ||
    inProtectedTabsRoute;

  if (segments.length === 0) {
    return ROUTES.USERS;
  }

  if (!currentUser && inProtectedGroup) {
    return ROUTES.LOGIN;
  }

  if (currentUser && inAuthGroup) {
    return ROUTES.USERS;
  }

  return null;
};
