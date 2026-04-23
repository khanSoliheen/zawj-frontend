/* global jest, describe, it, expect, beforeEach */

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockGetToken = jest.fn();
const mockSetToken = jest.fn();
const mockRegister = jest.fn();

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    getToken: (...args: unknown[]) => mockGetToken(...args),
    setToken: (...args: unknown[]) => mockSetToken(...args),
  },
}));

jest.mock('@/services/auth', () => ({
  __esModule: true,
  default: {
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

import SessionService from '@/services/session';

describe('SessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps the current session user into the frontend session shape', async () => {
    mockGetToken.mockResolvedValue('token-1');
    mockGet.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      user_metadata: { role: 'admin' },
    });

    await expect(SessionService.getCurrentUser()).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
      userMetadata: { role: 'admin' },
    });
  });

  it('returns null when there is no active session token', async () => {
    mockGetToken.mockResolvedValue(null);

    await expect(SessionService.getCurrentUser()).resolves.toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('clears the token when the backend session lookup fails', async () => {
    mockGetToken.mockResolvedValue('token-1');
    mockGet.mockRejectedValue(new Error('invalid session'));

    await expect(SessionService.getCurrentUser()).resolves.toBeNull();
    expect(mockSetToken).toHaveBeenCalledWith(null);
  });

  it('returns the raw session token wrapper from getSession', async () => {
    mockGetToken.mockResolvedValue('token-1');

    await expect(SessionService.getSession()).resolves.toEqual({
      access_token: 'token-1',
    });
  });

  it('maps the signed-in user from the backend login response', async () => {
    mockPost.mockResolvedValue({
      token: 'token-2',
      user: {
        id: 'user-2',
        email: 'sign-in@example.com',
        user_metadata: { plan: 'pro' },
      },
    });

    await expect(SessionService.signIn({
      email: 'sign-in@example.com',
      password: 'secret123',
    })).resolves.toEqual({
      id: 'user-2',
      email: 'sign-in@example.com',
      userMetadata: { plan: 'pro' },
    });

    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'sign-in@example.com',
      password: 'secret123',
    }, { auth: false });
    expect(mockSetToken).toHaveBeenCalledWith('token-2');
  });

  it('passes the correct scope to backend signOut', async () => {
    mockGetToken.mockResolvedValue('token-1');
    mockPost.mockResolvedValue({ message: 'signed out' });

    await SessionService.signOut();
    await SessionService.signOut('global');

    expect(mockPost).toHaveBeenNthCalledWith(1, '/auth/logout', { scope: 'local' });
    expect(mockPost).toHaveBeenNthCalledWith(2, '/auth/logout', { scope: 'global' });
    expect(mockSetToken).toHaveBeenCalledTimes(2);
  });

  it('maps auth state change payloads and unsubscribes cleanly', () => {
    const callback = jest.fn();
    const cleanup = SessionService.onAuthStateChange(callback);

    mockPost.mockResolvedValue({
      token: 'token-3',
      user: {
        id: 'user-3',
        email: 'listener@example.com',
        user_metadata: { locale: 'en' },
      },
    });

    return SessionService.signIn({
      email: 'listener@example.com',
      password: 'secret123',
    }).then(() => {
      expect(callback).toHaveBeenCalledWith({
        id: 'user-3',
        email: 'listener@example.com',
        userMetadata: { locale: 'en' },
      });

      cleanup();
    });
  });
});
