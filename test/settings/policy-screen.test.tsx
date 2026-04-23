/* global jest, describe, it, expect */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import IslamicPolicy from '@/screens/settings/policy';

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
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('Islamic policy screen', () => {
  it('navigates to the report flow', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<IslamicPolicy />);
    });

    act(() => {
      findButtonByLabel(renderer!.root, 'Report Misconduct')?.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith(ROUTES.SETTINGS_REPORT);
  });
});
