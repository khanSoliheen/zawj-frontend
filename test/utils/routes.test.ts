/* global describe, it, expect */

import { PROTECTED_SEGMENTS, ROUTES, buildChatRoute, buildUserRoute } from '@/constants/routes';

describe('routes', () => {
  it('keeps auth and settings routes stable', () => {
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.USERS).toBe('/users');
    expect(ROUTES.SETTINGS).toBe('/screens/settings');
    expect(ROUTES.SUPPORT).toBe('/screens/support');
  });

  it('builds dynamic user and chat routes', () => {
    expect(buildUserRoute('user-42')).toBe('/users/user-42');
    expect(buildChatRoute('chat-9')).toBe('/chat/chat-9');
  });

  it('marks the expected app segments as protected', () => {
    expect(PROTECTED_SEGMENTS.has('(tabs)')).toBe(true);
    expect(PROTECTED_SEGMENTS.has('screens')).toBe(true);
    expect(PROTECTED_SEGMENTS.has('support')).toBe(true);
    expect(PROTECTED_SEGMENTS.has('(auth)')).toBe(false);
  });
});
