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
}));

jest.mock('@/components', () => {
  const React = require('react');
  return {
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
  };
});

jest.mock('expo-router', () => {
  const React = require('react');

  const TabsComponent = ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
    React.createElement('MockTabs', props, children);

  TabsComponent.Screen = (props: Record<string, unknown>) => React.createElement('MockTabsScreen', props);

  return {
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

    expect(screens[4]?.props.options).toEqual({ href: null });
    expect(screens[5]?.props.options).toEqual({ href: null });
  });
});
