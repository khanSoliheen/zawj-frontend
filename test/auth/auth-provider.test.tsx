/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@/services/session', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}));

jest.mock('@/services/billing', () => ({
  __esModule: true,
  default: {
    getStatus: jest.fn(),
  },
}));

import { AuthProvider, useAuth } from '@/hooks/userContext';
import BillingService from '@/services/billing';
import SessionService from '@/services/session';

type AuthSnapshot = ReturnType<typeof useAuth>;
type SessionUser = {
  id: string;
  email: string | null;
  userMetadata: Record<string, unknown>;
};

const mockSessionService = SessionService as unknown as {
  getCurrentUser: jest.Mock;
  signIn: jest.Mock;
  signOut: jest.Mock;
  onAuthStateChange: jest.Mock;
};
const mockBillingService = BillingService as unknown as {
  getStatus: jest.Mock;
};

let latestAuth: AuthSnapshot | null = null;

const Probe = () => {
  latestAuth = useAuth();
  return null;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    latestAuth = null;
    jest.clearAllMocks();
    mockSessionService.getCurrentUser.mockResolvedValue(null);
    mockSessionService.signIn.mockResolvedValue(null);
    mockSessionService.signOut.mockResolvedValue(undefined);
    mockSessionService.onAuthStateChange.mockImplementation(() => jest.fn());
    mockBillingService.getStatus.mockResolvedValue({
      status: 'free',
      access_state: 'free',
      active: false,
      offer: {
        plan_code: 'premium_quarterly',
        price_inr: 500,
        duration_days: 90,
        grace_period_days: 3,
        referral_bonus_premium_days: 30,
      },
    });
  });

  it('hydrates the initial session from SessionService', async () => {
    const user: SessionUser = {
      id: 'user-1',
      email: 'provider@example.com',
      userMetadata: { role: 'member' },
    };

    mockSessionService.getCurrentUser.mockResolvedValue(user);

    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );
    });

    expect(mockSessionService.getCurrentUser).toHaveBeenCalled();
    expect(latestAuth?.isLoading).toBe(false);
    expect(latestAuth?.currentUser).toEqual(user);
    expect(mockBillingService.getStatus).toHaveBeenCalled();
  });

  it('updates the current user when the auth listener fires', async () => {
    let authListener: ((user: SessionUser | null) => void) | undefined;

    mockSessionService.onAuthStateChange.mockImplementation((callback: (user: SessionUser | null) => void) => {
      authListener = callback;
      return jest.fn();
    });

    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );
    });

    await act(async () => {
      authListener?.({
        id: 'user-2',
        email: 'listener@example.com',
        userMetadata: { locale: 'en' },
      });
    });

    expect(latestAuth?.currentUser).toEqual({
      id: 'user-2',
      email: 'listener@example.com',
      userMetadata: { locale: 'en' },
    });
  });

  it('stores the returned user after login', async () => {
    const user: SessionUser = {
      id: 'user-3',
      email: 'login@example.com',
      userMetadata: {},
    };

    mockSessionService.signIn.mockResolvedValue(user);

    await act(async () => {
      TestRenderer.create(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await latestAuth?.login({
        email: 'login@example.com',
        password: 'secret123',
      });
    });

    expect(mockSessionService.signIn).toHaveBeenCalledWith({
      email: 'login@example.com',
      password: 'secret123',
    });
    expect(latestAuth?.currentUser).toEqual(user);
  });

  it('cleans up the auth subscription on unmount', async () => {
    const cleanup = jest.fn();

    mockSessionService.onAuthStateChange.mockImplementation(() => cleanup);

    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );
    });

    act(() => {
      renderer.unmount();
    });

    expect(cleanup).toHaveBeenCalled();
  });
});
