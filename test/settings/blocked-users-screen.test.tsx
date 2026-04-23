/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockGetBlockedUsers = jest.fn();
const mockUnblockUser = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    danger: '#ff453a',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    md: 20,
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
}));

jest.mock('@/services/settings', () => ({
  __esModule: true,
  default: {
    getBlockedUsers: (...args: unknown[]) => mockGetBlockedUsers(...args),
    unblockUser: (...args: unknown[]) => mockUnblockUser(...args),
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

import BlockedUsers from '@/screens/settings/blocked-users';

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('BlockedUsers screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBlockedUsers.mockResolvedValue([
      {
        blocked_user_id: 'blocked-1',
        created_at: '2026-01-10T00:00:00.000Z',
        full_name: 'Blocked User',
        avatar_url: null,
      },
    ]);
    mockUnblockUser.mockResolvedValue({ message: 'ok' });
  });

  it('loads blocked users and unblocks a selected profile', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<BlockedUsers />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Unblock')?.props.onPress();
    });

    expect(mockGetBlockedUsers).toHaveBeenCalled();
    expect(mockUnblockUser).toHaveBeenCalledWith('blocked-1');
    expect(mockShow).toHaveBeenCalledWith('success', 'User unblocked');
  });
});
