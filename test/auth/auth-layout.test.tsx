/* global jest, describe, it, expect */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Stack: (props: Record<string, unknown>) => React.createElement('MockStack', props),
  };
});

import AuthLayout from '@/(auth)/_layout';

const getMountedRenderer = (renderer: TestRenderer.ReactTestRenderer | null) => {
  if (renderer === null) {
    throw new Error('Renderer did not mount');
  }

  return renderer;
};

describe('Auth layout', () => {
  it('renders the auth stack without headers', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<AuthLayout />);
    });

    const mountedRenderer = getMountedRenderer(renderer);
    const stack = mountedRenderer.root.find((node) => String(node.type) === 'MockStack');

    expect(stack.props.screenOptions).toEqual({ headerShown: false });
  });
});
