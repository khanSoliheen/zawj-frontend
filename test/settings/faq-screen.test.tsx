/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import FaqScreen from '@/screens/settings/faq';

const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    card: '#f5f5f5',
    secondary: '#dddddd',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    m: 16,
    md: 20,
    xl: 24,
    cardRadius: 16,
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

describe('FAQ screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expands answers and links to support', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<FaqScreen />);
    });

    const getTexts = () =>
      renderer!.root
        .findAll((node) => String(node.type) === 'MockText')
        .map((node) => node.children.join(''));

    expect(getTexts()).toContain('FAQ');
    expect(getTexts()).toContain('Can anyone see my full profile?');
    expect(getTexts()).toContain('Only users who can access the app can browse public profiles. Some visibility and messaging controls are available in your settings.');
    expect(getTexts()).not.toContain('Account deletion is a soft delete. Your account is removed from active use, you are signed out, and the same email cannot be used to register again.');

    act(() => {
      findButtonByLabel(renderer!.root, 'What happens if I delete my account?')?.props.onPress();
    });

    expect(getTexts()).toContain('Account deletion is a soft delete. Your account is removed from active use, you are signed out, and the same email cannot be used to register again.');

    act(() => {
      findButtonByLabel(renderer!.root, 'Contact Support')?.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith(ROUTES.SUPPORT);
  });
});
