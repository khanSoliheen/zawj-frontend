/* global jest, describe, it, expect, beforeEach, afterEach */

import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { ROUTES, buildUserRoute } from '@/constants/routes';
import BlockUserScreen from '@/screens/settings/user-block';

const mockShow = jest.fn();
const mockGetUser = jest.fn();
const mockGetBlockStatus = jest.fn();
const mockBlockUser = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    danger: '#ff453a',
    primary: '#111111',
    white: '#ffffff',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    md: 20,
    m: 16,
  },
  assets: {
    arrow: 1,
    avatar1: 1,
  },
};

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
  useAuth: () => ({
    currentUser: {
      id: 'user-1',
    },
  }),
}));

jest.mock('@/services/settings', () => ({
  __esModule: true,
  default: {
    getBlockStatus: (...args: unknown[]) => mockGetBlockStatus(...args),
    blockUser: (...args: unknown[]) => mockBlockUser(...args),
    unblockUser: jest.fn(),
  },
}));

jest.mock('@/services/users', () => ({
  __esModule: true,
  default: {
    getUser: (...args: unknown[]) => mockGetUser(...args),
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

const mockUseLocalSearchParams = useLocalSearchParams as unknown as jest.Mock;

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('BlockUserScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ id: 'target-1' });
    mockGetUser.mockResolvedValue({
      id: 'target-1',
      first_name: 'Target',
      last_name: 'User',
      avatar_url: null,
    });
    mockGetBlockStatus.mockResolvedValue({ blocked: false });
    mockBlockUser.mockResolvedValue({ message: 'ok' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('blocks a target user after confirmation', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<BlockUserScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Block user')?.props.onPress();
    });

    expect(mockBlockUser).toHaveBeenCalledWith('target-1');
    expect(mockShow).toHaveBeenCalledWith('success', 'User blocked');
  });

  it('navigates to the related profile and report flows', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<BlockUserScreen />);
    });
    await act(async () => {});

    act(() => {
      findButtonByLabel(renderer!.root, 'View profile')?.props.onPress();
    });
    act(() => {
      findButtonByLabel(renderer!.root, 'Report user')?.props.onPress();
    });

    expect(router.push).toHaveBeenNthCalledWith(1, buildUserRoute('target-1'));
    expect(router.push).toHaveBeenNthCalledWith(2, {
      pathname: ROUTES.SETTINGS_REPORT,
      params: { reported_user_id: 'target-1', context: 'Profile' },
    });
  });
});
