/* global jest, describe, it, expect, beforeEach, afterEach */

import { router } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

const mockGetConversations = jest.fn();
const mockShow = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    card: '#f5f5f5',
    primary: '#111111',
    secondary: '#e8eefc',
    text: '#111111',
    white: '#ffffff',
  },
  sizes: {
    s: 8,
    m: 16,
    l: 24,
    cardRadius: 12,
  },
  assets: {
    avatar1: 1,
    avatar2: 2,
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
      id: 'me',
    },
  }),
  useRealtime: () => ({
    lastEvent: null,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: () => {},
}));

jest.mock('@/services/chat', () => ({
  __esModule: true,
  default: {
    getConversations: (...args: unknown[]) => mockGetConversations(...args),
  },
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };

  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
  };
});

import ChatList from '@/(tabs)/chat';
import { buildChatRoute } from '@/constants/routes';

describe('ChatList screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.spyOn(StatusBar, 'setBarStyle').mockImplementation(jest.fn());
    mockGetConversations.mockResolvedValue([
      {
        id: 'conversation-1',
        peer_id: 'peer-1',
        peer_first_name: 'Fatima',
        peer_last_name: 'Ali',
        last_message: 'Latest message',
        last_message_at: '2026-01-10T10:00:00.000Z',
        peer_avatar_url: null,
        unread: true,
      },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('navigates with the conversation id and peer id from the mapped chat item', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatList />);
    });
    await act(async () => {});

    const pressable = renderer!.root.find((node) => typeof node.props.onPress === 'function');

    act(() => {
      pressable.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith({
      pathname: buildChatRoute('conversation-1'),
      params: {
        name: 'Fatima Ali',
        peerId: 'peer-1',
        peerAvatarUrl: '',
      },
    });

    act(() => {
      renderer!.unmount();
    });
  });

  it('renders an unread indicator for unread conversations', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatList />);
    });
    await act(async () => {});

    const badges = renderer!.root.findAll((node) =>
      String(node.type) === 'MockText' && node.children.join('') === 'New',
    );

    expect(badges).toHaveLength(1);

    act(() => {
      renderer!.unmount();
    });
  });
});
