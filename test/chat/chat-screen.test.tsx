/* global jest, describe, it, expect, beforeEach, afterEach */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockGetConnection = jest.fn();
const mockGetMessages = jest.fn();
const mockAcceptConnection = jest.fn();
const mockDeclineConnection = jest.fn();
const mockEnsureConnection = jest.fn();
const mockEnsureConversation = jest.fn();
const mockSendMessage = jest.fn();
const mockGetUser = jest.fn();
const mockShow = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    white: '#ffffff',
    gray: '#808080',
    text: '#111111',
  },
  sizes: {
    s: 8,
    m: 16,
    md: 20,
  },
  assets: {
    arrow: 1,
    more: 2,
    avatar1: 3,
    avatar2: 4,
  },
  gradients: {
    dark: ['#111111', '#222222'],
  },
};

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: () => {},
}));

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
}));

jest.mock('react-native', () => {
  const React = require('react');

  return {
    FlatList: React.forwardRef((props: Record<string, unknown> & { children?: unknown }, _ref: React.ForwardedRef<unknown>) => {
      const items = Array.isArray(props.data) ? props.data : [];
      const renderItem = props.renderItem as any;
      const renderedItems = typeof renderItem === 'function'
        ? items.map((item, index) => React.createElement(
            React.Fragment,
            { key: String((item as { id?: string; header?: string }).id ?? (item as { header?: string }).header ?? index) },
            renderItem({ item, index }),
          ))
        : null;

      return React.createElement('MockFlatList', props, renderedItems ?? props.children);
    }),
    TouchableOpacity: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockTouchableOpacity', props, children),
  };
});

jest.mock('@/services/chat', () => ({
  __esModule: true,
  default: {
    getConnection: (...args: unknown[]) => mockGetConnection(...args),
    getMessages: (...args: unknown[]) => mockGetMessages(...args),
    acceptConnection: (...args: unknown[]) => mockAcceptConnection(...args),
    declineConnection: (...args: unknown[]) => mockDeclineConnection(...args),
    ensureConnection: (...args: unknown[]) => mockEnsureConnection(...args),
    ensureConversation: (...args: unknown[]) => mockEnsureConversation(...args),
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
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
    AcceptMessage: (props: Record<string, unknown>) => React.createElement('MockAcceptMessage', props),
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Bubble: (props: Record<string, unknown>) => React.createElement('MockBubble', props),
    Button: ({ children, ...props }: MockComponentProps) => React.createElement('MockButton', props, children),
    DateDivider: (props: Record<string, unknown>) => React.createElement('MockDateDivider', props),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
    MoreMenu: (props: Record<string, unknown>) => React.createElement('MockMoreMenu', props),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
    TimeStamp: (props: Record<string, unknown>) => React.createElement('MockTimeStamp', props),
  };
});

import ChatScreen from '@/(tabs)/chat/[id]';

const mockUseLocalSearchParams = useLocalSearchParams as unknown as jest.Mock;

const unmountRenderer = (renderer: TestRenderer.ReactTestRenderer | null) => {
  if (renderer === null) {
    return;
  }

  act(() => {
    renderer.unmount();
  });
};

describe('Chat screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-10T10:06:00.000Z'));
    mockGetConnection.mockResolvedValue({
      id: 'connection-1',
      requester_id: 'peer-1',
      addressee_id: 'me',
      status: 'pending',
    });
    mockGetMessages.mockResolvedValue([]);
    mockAcceptConnection.mockResolvedValue({ message: 'request accepted' });
    mockDeclineConnection.mockResolvedValue({ message: 'request declined' });
    mockEnsureConnection.mockResolvedValue({
      id: 'connection-1',
      requester_id: 'me',
      addressee_id: 'peer-1',
      status: 'accepted',
    });
    mockEnsureConversation.mockResolvedValue({
      id: 'conversation-created',
    });
    mockSendMessage.mockResolvedValue({
      id: 'message-1',
      sender_id: 'me',
      content: 'Assalamu alaikum',
      created_at: '2026-01-10T10:00:00.000Z',
    });
    mockGetUser.mockResolvedValue({
      avatar_url: 'https://cdn.example.com/fallback-fatima.jpg',
    });
    mockUseLocalSearchParams.mockReturnValue({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Fatima',
      peerId: 'peer-1',
      peerAvatarUrl: 'https://cdn.example.com/fatima.jpg',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the accept request sheet for pending inbound connections', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    const acceptSheet = renderer!.root.find((node) => String(node.type) === 'MockAcceptMessage');

    expect(acceptSheet.props.visible).toBe(true);
    expect(acceptSheet.props.message).toBe('Accept message request from Fatima?');

    unmountRenderer(renderer);
  });

  it('refreshes connection and messages after accepting a request', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    const acceptSheet = renderer!.root.find((node) => String(node.type) === 'MockAcceptMessage');

    await act(async () => {
      await acceptSheet.props.onAction();
    });

    expect(mockAcceptConnection).toHaveBeenCalledWith('connection-1');
    expect(mockGetConnection).toHaveBeenCalledTimes(2);
    expect(mockGetMessages).toHaveBeenCalledTimes(2);
    expect(mockShow).toHaveBeenCalledWith('success', 'Request accepted');

    unmountRenderer(renderer);
  });

  it('refreshes connection and messages after declining a request', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    const acceptSheet = renderer!.root.find((node) => String(node.type) === 'MockAcceptMessage');

    await act(async () => {
      await acceptSheet.props.onDecline();
    });

    expect(mockDeclineConnection).toHaveBeenCalledWith('connection-1');
    expect(mockGetConnection).toHaveBeenCalledTimes(2);
    expect(mockGetMessages).toHaveBeenCalledTimes(2);
    expect(mockShow).toHaveBeenCalledWith('info', 'Request declined');

    unmountRenderer(renderer);
  });

  it('uses the route-provided peer avatar in the header and bubble fallbacks', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    const images = renderer!.root.findAll((node) => String(node.type) === 'MockImage');
    expect(images.some((node) => node.props.source?.uri === 'https://cdn.example.com/fatima.jpg')).toBe(true);

    unmountRenderer(renderer);
  });

  it('fetches the peer avatar when the route does not provide one', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'new',
      name: 'Fatima',
      peerId: 'peer-1',
      peerAvatarUrl: '',
    });

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    expect(mockGetUser).toHaveBeenCalledWith('peer-1');

    const images = renderer!.root.findAll((node) => String(node.type) === 'MockImage');
    expect(images.some((node) => node.props.source?.uri === 'https://cdn.example.com/fallback-fatima.jpg')).toBe(true);

    unmountRenderer(renderer);
  });

  it('creates the conversation only when the first message is sent', async () => {
    mockGetConnection.mockResolvedValue(null);
    mockUseLocalSearchParams.mockReturnValue({
      id: 'new',
      name: 'Fatima',
      peerId: 'peer-1',
      peerAvatarUrl: '',
    });

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    const input = renderer!.root.find((node) => String(node.type) === 'MockInput');
    act(() => {
      input.props.onChangeText('Assalamu alaikum');
    });

    const buttons = renderer!.root.findAll((node) => String(node.type) === 'MockButton');
    const sendButton = buttons[buttons.length - 1];

    await act(async () => {
      await sendButton.props.onPress();
    });

    expect(mockEnsureConversation).toHaveBeenCalledWith('peer-1');
    expect(mockSendMessage).toHaveBeenCalledWith('conversation-created', 'Assalamu alaikum');

    unmountRenderer(renderer);
  });

  it('shows the peer avatar on the latest seen outgoing message', async () => {
    mockGetConnection.mockResolvedValue({
      id: 'connection-1',
      requester_id: 'me',
      addressee_id: 'peer-1',
      status: 'accepted',
    });
    mockGetMessages.mockResolvedValue([
      {
        id: 'message-1',
        sender_id: 'me',
        content: 'Assalamu alaikum',
        created_at: '2026-01-10T10:00:00.000Z',
        read_at: '2026-01-10T10:01:00.000Z',
      },
      {
        id: 'message-2',
        sender_id: 'me',
        content: 'Checking in',
        created_at: '2026-01-10T10:02:00.000Z',
        read_at: '2026-01-10T10:03:00.000Z',
      },
    ]);

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    const initialTimeStamps = renderer!.root.findAll((node) => String(node.type) === 'MockTimeStamp');
    expect(initialTimeStamps).toHaveLength(1);
    expect(initialTimeStamps[0].props.seen).toBe(true);
    expect(initialTimeStamps[0].props.avatarOnly).toBe(true);

    const touchables = renderer!.root.findAll((node) => String(node.type) === 'MockTouchableOpacity');
    const firstTouchable = touchables[0];
    const secondTouchable = touchables[1];

    act(() => {
      firstTouchable.props.onPress();
      secondTouchable.props.onPress();
    });

    const timeStamps = renderer!.root.findAll((node) => String(node.type) === 'MockTimeStamp');
    const seenTimeStamps = timeStamps.filter((node) => node.props.seen === true);
    const detailTimeStamps = timeStamps.filter((node) => node.props.seen !== true);
    expect(seenTimeStamps).toHaveLength(1);
    expect(detailTimeStamps).toHaveLength(1);
    expect(seenTimeStamps[0].props.seenAvatar?.uri).toBe('https://cdn.example.com/fatima.jpg');
    expect(seenTimeStamps[0].props.avatarOnly).toBe(false);
    expect(seenTimeStamps[0].props.label).toBe('Seen 3m ago');
    expect(detailTimeStamps[0].props.label).toContain('Jan 10, 2026');

    unmountRenderer(renderer);
  });

  it('does not show a seen row for an older seen message when a newer message exists', async () => {
    mockGetConnection.mockResolvedValue({
      id: 'connection-1',
      requester_id: 'me',
      addressee_id: 'peer-1',
      status: 'accepted',
    });
    mockGetMessages.mockResolvedValue([
      {
        id: 'message-1',
        sender_id: 'me',
        content: 'Assalamu alaikum',
        created_at: '2026-01-10T10:00:00.000Z',
        read_at: '2026-01-10T10:01:00.000Z',
      },
      {
        id: 'message-2',
        sender_id: 'peer-1',
        content: 'Wa alaikum salam',
        created_at: '2026-01-10T10:04:00.000Z',
        read_at: null,
      },
    ]);

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    expect(renderer!.root.findAll((node) => String(node.type) === 'MockTimeStamp')).toHaveLength(0);

    unmountRenderer(renderer);
  });

  it('hides seen state when the backend does not return read_at', async () => {
    mockGetConnection.mockResolvedValue({
      id: 'connection-1',
      requester_id: 'me',
      addressee_id: 'peer-1',
      status: 'accepted',
    });
    mockGetMessages.mockResolvedValue([
      {
        id: 'message-1',
        sender_id: 'me',
        content: 'Assalamu alaikum',
        created_at: '2026-01-10T10:00:00.000Z',
        read_at: null,
      },
    ]);

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChatScreen />);
    });
    await act(async () => {});

    expect(renderer!.root.findAll((node) => String(node.type) === 'MockTimeStamp')).toHaveLength(0);

    const touchable = renderer!.root.find((node) => String(node.type) === 'MockTouchableOpacity');
    act(() => {
      touchable.props.onPress();
    });

    const timeStamps = renderer!.root.findAll((node) => String(node.type) === 'MockTimeStamp');
    expect(timeStamps).toHaveLength(1);
    expect(timeStamps[0].props.seen).not.toBe(true);
    expect(timeStamps[0].props.label).toContain('Jan 10, 2026');

    unmountRenderer(renderer);
  });
});
