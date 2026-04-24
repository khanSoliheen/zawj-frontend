/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockGetNotificationCenter = jest.fn();
const mockMarkNotificationCenterSeen = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    card: '#f6f6f6',
    gray: '#808080',
    primary: '#111111',
    text: '#111111',
    white: '#ffffff',
  },
  sizes: {
    padding: 16,
    s: 8,
    xs: 4,
    sm: 12,
    m: 16,
    cardRadius: 16,
  },
  assets: {
    arrow: 1,
    avatar1: 2,
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
    getNotificationCenter: (...args: unknown[]) => mockGetNotificationCenter(...args),
    markNotificationCenterSeen: (...args: unknown[]) => mockMarkNotificationCenterSeen(...args),
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

import NotificationsCenter from '@/screens/notifications-center';

describe('NotificationsCenter screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNotificationCenter.mockResolvedValue({
      unread_chat_count: 1,
      pending_message_request_count: 1,
      unread_match_count: 1,
      photo_request_count: 2,
      photo_requests: [
        {
          viewer_id: 'viewer-1',
          full_name: 'Aisha Khan',
          avatar_url: null,
          requested_at: '2026-04-23T11:00:00Z',
        },
      ],
      message_requests: [
        {
          connection_id: 'conn-1',
          user_id: 'user-3',
          conversation_id: 'conv-1',
          full_name: 'Sara Ali',
          avatar_url: null,
          created_at: '2026-04-23T10:00:00Z',
        },
      ],
      matches: [
        {
          id: 'notif-1',
          user_id: 'user-2',
          full_name: 'Maryam Khan',
          avatar_url: null,
          created_at: '2026-04-23T12:00:00Z',
        },
      ],
      unread_messages: [
        {
          conversation_id: 'conv-2',
          user_id: 'user-4',
          full_name: 'Fatima Noor',
          avatar_url: null,
          message_preview: 'Assalamu alaikum',
          created_at: '2026-04-23T09:00:00Z',
        },
      ],
    });
    mockMarkNotificationCenterSeen.mockResolvedValue({ message: 'ok' });
  });

  it('loads message requests, photo requests, matches, and unread messages', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<NotificationsCenter />);
    });
    await act(async () => {});

    const textContent = renderer!.root
      .findAll((node) => String(node.type) === 'MockText')
      .map((node) => node.children.join(' '));

    expect(mockGetNotificationCenter).toHaveBeenCalled();
    expect(mockMarkNotificationCenterSeen).toHaveBeenCalled();
    expect(textContent).toContain('Notifications');
    expect(textContent).toContain('Message requests');
    expect(textContent).toContain('Sara Ali');
    expect(textContent).toContain('Sent you a first message request');
    expect(textContent).toContain('Photo requests');
    expect(textContent).toContain('Aisha Khan');
    expect(textContent).toContain('New matches');
    expect(textContent).toContain('Maryam Khan');
    expect(textContent).toContain('You have a new match');
    expect(textContent).toContain('New messages');
    expect(textContent).toContain('Fatima Noor');
    expect(textContent).toContain('Assalamu alaikum');
  });
});
