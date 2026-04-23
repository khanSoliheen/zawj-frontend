/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import SessionsSettings from '@/screens/settings/session';
import SessionService from '@/services/session';

const mockShow = jest.fn();
const mockLogout = jest.fn();
const mockGetSessionInfo = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    danger: '#ff453a',
  },
  sizes: {
    padding: 16,
    xs: 4,
    s: 8,
    sm: 12,
    md: 20,
    m: 16,
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useAuth: () => ({
    logout: mockLogout,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
}));

jest.mock('@/services/session', () => ({
  __esModule: true,
  default: {
    signOut: jest.fn(),
  },
}));

jest.mock('@/services/settings', () => ({
  __esModule: true,
  default: {
    getSessionInfo: (...args: unknown[]) => mockGetSessionInfo(...args),
  },
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };

  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Button: ({ children, ...props }: MockComponentProps) => React.createElement('MockButton', props, children),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
  };
});

const mockSessionService = SessionService as unknown as {
  signOut: jest.Mock;
};

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('SessionsSettings screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionService.signOut.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);
    mockGetSessionInfo.mockResolvedValue({
      user_email: 'session@example.com',
      created_at: '2026-01-10T10:00:00.000Z',
      expires_at: '2026-01-10T12:00:00.000Z',
    });
  });

  it('signs out of other devices', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<SessionsSettings />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Sign out of other devices')?.props.onPress();
    });

    expect(mockSessionService.signOut).toHaveBeenCalledWith('others');
    expect(mockShow).toHaveBeenCalledWith('success', 'Signed out of other devices');
  });

  it('signs out everywhere and redirects to login', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<SessionsSettings />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Sign out of all devices')?.props.onPress();
    });

    expect(mockLogout).toHaveBeenCalledWith('global');
    expect(mockShow).toHaveBeenCalledWith('success', 'Signed out everywhere');
    expect(router.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
  });
});
