/* global jest, describe, it, expect */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockTheme = {
  colors: {
    primary: '#111111',
    gray: '#808080',
    card: '#ffffff',
  },
  assets: {
    home: 1,
    chat: 2,
    extras: 3,
    profile: 4,
  },
};

const mockSummary = {
  unread_chat_count: 1,
  pending_message_request_count: 1,
  photo_request_count: 2,
  unread_match_count: 1,
  unread_interest_count: 0,
  unread_billing_count: 0,
};

jest.mock('@/hooks', () => ({
  useData: () => ({
    theme: mockTheme,
  }),
  useAuth: () => ({
    currentUser: {
      userMetadata: {
        avatar_url: null,
        gender: 'Male',
      },
    },
  }),
  useRealtime: () => ({
    summary: mockSummary,
  }),
}));

jest.mock('@/components', () => {
  const React = require('react');
  return {
    Block: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) => React.createElement('MockBlock', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
    Text: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) => React.createElement('MockText', props, children),
  };
});

jest.mock('expo-router', () => {
  const React = require('react');

  const TabsComponent = ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
    React.createElement('MockTabs', props, children);

  TabsComponent.Screen = (props: Record<string, unknown>) => React.createElement('MockTabsScreen', props);

  return {
    router: {
      push: jest.fn(),
    },
    Tabs: TabsComponent,
  };
});

import TabsLayout from '@/(tabs)/_layout';

const getMountedRenderer = (renderer: TestRenderer.ReactTestRenderer | null) => {
  if (renderer === null) {
    throw new Error('Renderer did not mount');
  }

  return renderer;
};

describe('Tabs layout', () => {
  beforeEach(() => {
    mockSummary.unread_chat_count = 1;
    mockSummary.pending_message_request_count = 1;
  });

  it('registers the visible and hidden tab screens', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<TabsLayout />);
    });

    const mountedRenderer = getMountedRenderer(renderer);
    const screens = mountedRenderer.root.findAll((node) => String(node.type) === 'MockTabsScreen');

    expect(screens.map((node) => node.props.name)).toEqual([
      'users/index',
      'chat/index',
      'preferences',
      'profile/index',
      'users/[id]',
      'chat/[id]',
    ]);

    expect(screens[4]?.props.options).toEqual({ href: null, headerShown: false });
    expect(screens[5]?.props.options).toEqual({ href: null, headerShown: false });

    const tabsNode = mountedRenderer.root.find((node) => String(node.type) === 'MockTabs');
    const chatIcon = screens[1]?.props.options?.tabBarIcon?.({ color: '#111111' });

    expect(chatIcon).toBeTruthy();
    expect(tabsNode.props.screenOptions.headerShown).toBe(false);
  });

  it('shows the chat badge when there are unread chats or pending requests', async () => {
    mockSummary.unread_chat_count = 0;
    mockSummary.pending_message_request_count = 1;

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<TabsLayout />);
    });

    const screens = getMountedRenderer(renderer).root.findAll((node) => String(node.type) === 'MockTabsScreen');
    const chatIcon = screens[1]?.props.options?.tabBarIcon?.({ color: '#111111' });
    const children = React.Children.toArray(chatIcon?.props?.children);
    const badge = children.find((child) => React.isValidElement(child) && child.props.width === 8 && child.props.height === 8);

    expect(badge).toBeTruthy();
  });

  it('hides the chat badge when there are no unread chats or requests', async () => {
    mockSummary.unread_chat_count = 0;
    mockSummary.pending_message_request_count = 0;

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<TabsLayout />);
    });

    const screens = getMountedRenderer(renderer).root.findAll((node) => String(node.type) === 'MockTabsScreen');
    const chatIcon = screens[1]?.props.options?.tabBarIcon?.({ color: '#111111' });
    const children = React.Children.toArray(chatIcon?.props?.children);
    const badge = children.find((child) => React.isValidElement(child) && child.props.width === 8 && child.props.height === 8);

    expect(badge).toBeUndefined();
  });
});
