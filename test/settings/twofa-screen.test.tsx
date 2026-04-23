/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const { ROUTES } = require('@/constants/routes');
const TwoFactorSettings = require('@/screens/settings/twofa').default;

const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    danger: '#ff453a',
    primary: '#111111',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    m: 16,
    md: 20,
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('@/hooks', () => ({
  useData: () => ({
    theme: mockTheme,
  }),
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

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('TwoFactorSettings screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes users to support because backend 2FA is not implemented yet', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<TwoFactorSettings />);
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Contact support')?.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith(ROUTES.SUPPORT);
  });
});
