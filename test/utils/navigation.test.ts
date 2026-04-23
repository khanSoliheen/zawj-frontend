/* global describe, it, expect */

import { ROUTES } from '@/constants/routes';
import { getNavigationRedirect } from '@/utils/navigation';

describe('getNavigationRedirect', () => {
  it('returns null while auth is still loading', () => {
    expect(getNavigationRedirect({
      currentUser: null,
      isLoading: true,
      rootNavigationKey: 'root',
      segments: ['screens'],
    })).toBeNull();
  });

  it('returns null before the root navigator is ready', () => {
    expect(getNavigationRedirect({
      currentUser: null,
      isLoading: false,
      rootNavigationKey: undefined,
      segments: ['screens'],
    })).toBeNull();
  });

  it('redirects guests away from protected groups', () => {
    expect(getNavigationRedirect({
      currentUser: null,
      isLoading: false,
      rootNavigationKey: 'root',
      segments: ['screens', 'settings'],
    })).toBe(ROUTES.LOGIN);
  });

  it('redirects the root route to the users list', () => {
    expect(getNavigationRedirect({
      currentUser: null,
      isLoading: false,
      rootNavigationKey: 'root',
      segments: [],
    })).toBe(ROUTES.USERS);
  });

  it('allows guests onto the users list route', () => {
    expect(getNavigationRedirect({
      currentUser: null,
      isLoading: false,
      rootNavigationKey: 'root',
      segments: ['(tabs)', 'users'],
    })).toBeNull();
  });

  it('redirects guests away from protected user detail routes', () => {
    expect(getNavigationRedirect({
      currentUser: null,
      isLoading: false,
      rootNavigationKey: 'root',
      segments: ['(tabs)', 'users', '[id]'],
    })).toBe(ROUTES.LOGIN);
  });

  it('redirects signed-in users away from the auth group', () => {
    expect(getNavigationRedirect({
      currentUser: {
        id: 'user-1',
        email: 'user@example.com',
        userMetadata: {},
      },
      isLoading: false,
      rootNavigationKey: 'root',
      segments: ['(auth)', 'login'],
    })).toBe(ROUTES.USERS);
  });

  it('does not redirect when the current route is already valid', () => {
    expect(getNavigationRedirect({
      currentUser: {
        id: 'user-1',
        email: 'user@example.com',
        userMetadata: {},
      },
      isLoading: false,
      rootNavigationKey: 'root',
      segments: ['(tabs)', 'users'],
    })).toBeNull();
  });
});
