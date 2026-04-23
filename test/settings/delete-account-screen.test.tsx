/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import DeleteAccount from '@/screens/settings/delete-account';
import SessionService from '@/services/session';

const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    danger: '#ff453a',
    primary: '#111111',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    md: 20,
    m: 16,
    xl: 24,
  },
  assets: {
    arrow: 1,
  },
};

const mockShow = jest.fn();

jest.mock('@/hooks', () => ({
  useData: () => ({
    theme: mockTheme,
  }),
  useToast: () => ({
    show: mockShow,
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
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
  };
});

jest.mock('@/services/session', () => ({
  __esModule: true,
  default: {
    deleteAccount: jest.fn(),
  },
}));

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('DeleteAccount screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the account after explicit confirmation', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<DeleteAccount />);
    });

    const input = renderer!.root.findAll((node) => String(node.type) === 'MockInput')[0];
    act(() => {
      input.props.onChangeText('DELETE');
    });

    await act(async () => {
      findButtonByLabel(renderer!.root, 'Delete Account')?.props.onPress();
    });

    expect(SessionService.deleteAccount).toHaveBeenCalledWith('DELETE');
    expect(mockShow).toHaveBeenCalledWith('success', 'Account deleted');
    expect(router.replace).toHaveBeenCalledWith('/login');
  });
});
