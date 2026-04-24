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

jest.mock('@/hooks', () => ({
  useData: () => ({
    theme: mockTheme,
  }),
  useRealtime: () => ({
    summary: {
      unread_chat_count: 1,
      pending_message_request_count: 1,
      photo_request_count: 2,
      unread_match_count: 1,
    },
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
});
