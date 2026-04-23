/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockReplace = jest.fn();
const mockUseSegments = jest.fn(() => ['screens', 'settings']);
const mockUseRootNavigationState = jest.fn(() => ({ key: 'root' }));
const mockGetNavigationRedirect = jest.fn();
const mockSetTheme = jest.fn();
const mockTheme = {
  colors: {},
  sizes: {},
  assets: {},
} as const;

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    Slot: () => React.createElement('MockSlot'),
    useRouter: () => ({
      replace: mockReplace,
    }),
    useSegments: () => mockUseSegments(),
    useRootNavigationState: () => mockUseRootNavigationState(),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockSafeAreaView', props, children),
  };
});

jest.mock('../../src/utils/navigation', () => ({
  getNavigationRedirect: (...args: unknown[]) => mockGetNavigationRedirect(...args),
}));

jest.mock('../../src/hooks/useData', () => {
  const React = require('react');

  return {
    DataProvider: ({ children }: { children?: React.ReactNode }) => React.createElement('MockDataProvider', null, children),
    useData: () => ({
      theme: mockTheme,
      setTheme: mockSetTheme,
    }),
  };
});

jest.mock('../../src/hooks/userContext', () => {
  const React = require('react');

  return {
    AuthProvider: ({ children }: { children?: React.ReactNode }) => React.createElement('MockAuthProvider', null, children),
    useAuth: jest.fn(),
  };
});

jest.mock('../../src/hooks/toaster', () => {
  const React = require('react');

  return {
    ToastProvider: ({ children }: { children?: React.ReactNode }) => React.createElement('MockToastProvider', null, children),
  };
});

jest.mock('../../src/hooks/useTheme', () => {
  const React = require('react');

  return {
    ThemeProvider: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) =>
      React.createElement('MockThemeProvider', props, children),
  };
});

const { useAuth } = require('../../src/hooks/userContext') as typeof import('../../src/hooks/userContext');
const Layout = require('../../app/_layout').default as typeof import('../../app/_layout').default;

const mockUseAuth = useAuth as jest.Mock;

describe('App layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSegments.mockReturnValue(['screens', 'settings']);
    mockUseRootNavigationState.mockReturnValue({ key: 'root' });
    mockUseAuth.mockReturnValue({
      currentUser: null,
      isLoading: false,
    });
    mockGetNavigationRedirect.mockReturnValue('/login');
  });

  it('redirects through the navigation gate when a redirect is required', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Layout />);
    });

    expect(mockGetNavigationRedirect).toHaveBeenCalledWith({
      currentUser: null,
      isLoading: false,
      rootNavigationKey: 'root',
      segments: ['screens', 'settings'],
    });
    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(renderer!.root.findAll((node) => String(node.type) === 'MockThemeProvider')).toHaveLength(1);
    expect(renderer!.root.findAll((node) => String(node.type) === 'MockSlot')).toHaveLength(1);
  });

  it('renders nothing inside the gate while auth is loading', async () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      isLoading: true,
    });
    mockGetNavigationRedirect.mockReturnValue(null);

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Layout />);
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(renderer!.root.findAll((node) => String(node.type) === 'MockSlot')).toHaveLength(0);
  });
});
