/* global jest, describe, it, expect */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    Link: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockLink', props, children),
  };
});

jest.mock('react-native', () => {
  const React = require('react');

  return {
    ScrollView: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockScrollView', props, children),
    View: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockView', props, children),
    Text: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockNativeText', props, children),
    TouchableOpacity: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockTouchableOpacity', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockNativeImage', props),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
    },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated:${key}`,
  }),
}));

import { ROUTES } from '@/constants/routes';
import Welcome from '@/index';

type TestNode = TestRenderer.ReactTestInstance;

const getMountedRenderer = (renderer: TestRenderer.ReactTestRenderer | null) => {
  if (renderer === null) {
    throw new Error('Renderer did not mount');
  }

  return renderer;
};

describe('Welcome screen', () => {
  it('renders translated copy and only the login navigation link', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Welcome />);
    });

    const mountedRenderer = getMountedRenderer(renderer);
    const links = mountedRenderer.root.findAll((node: TestNode) => String(node.type) === 'MockLink');
    const textNodes = mountedRenderer.root.findAll((node: TestNode) => String(node.type) === 'MockNativeText');

    expect(textNodes.some((node: TestNode) => node.children.join('') === 'translated:find_your_life_partner')).toBe(true);
    expect(textNodes.some((node: TestNode) => node.children.join('') === 'translated:button.get_started')).toBe(true);
    expect(textNodes.some((node: TestNode) => node.children.join('') === 'translated:how_it_works')).toBe(true);
    expect(textNodes.some((node: TestNode) => node.children.join('') === 'translated:button.learn_more')).toBe(true);

    expect(links.map((node: TestNode) => node.props.href)).toEqual([ROUTES.LOGIN]);
  });
});
