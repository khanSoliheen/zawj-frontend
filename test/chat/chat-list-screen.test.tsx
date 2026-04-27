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
    avatarMale: 1,
    avatarFemale: 2,
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

jest.mock('react-native', () => {
  const React = require('react');

  return {
    StatusBar: {
      setBarStyle: jest.fn(),
    },
    ActivityIndicator: (props: Record<string, unknown>) => React.createElement('MockActivityIndicator', props),
    FlatList: ({
      data,
      renderItem,
      ListEmptyComponent,
      ...props
    }: Record<string, unknown> & {
      data?: unknown[];
      renderItem?: (params: { item: unknown; index: number }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode;
    }) => {
      const children = Array.isArray(data) && data.length > 0
        ? data.map((item, index) => React.createElement(React.Fragment, { key: index }, renderItem?.({ item, index })))
        : ListEmptyComponent ?? null;

      return React.createElement('MockFlatList', props, children);
    },
    TouchableOpacity: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockTouchableOpacity', props, children),
  };
});

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
        peer_gender: 'Female',
        last_message: 'Latest message',
        last_message_at: '2026-01-10T10:00:00.000Z',
        peer_avatar_url: null,
        peer_is_online: true,
        unread: true,
        status: 'accepted',
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

    const pressable = renderer!.root.findAll((node) =>
      String(node.type) === 'MockTouchableOpacity' && typeof node.props.onPress === 'function',
    ).at(-1);

    expect(pressable).toBeDefined();
    expect(typeof pressable?.props.onPress).toBe('function');

    act(() => {
      pressable!.props.onPress();
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
