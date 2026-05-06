/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockChangePassword = jest.fn();
const mockSignOut = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    primary: '#111111',
  },
  sizes: {
    s: 8,
    sm: 12,
    md: 20,
    padding: 16,
  },
  assets: {
    arrow: 1,
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

jest.mock('@/services/auth', () => ({
  __esModule: true,
  default: {
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
  },
}));

jest.mock('@/services/session', () => ({
  __esModule: true,
  default: {
    signOut: (...args: unknown[]) => mockSignOut(...args),
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
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
  };
});

import ChangePassword from '@/screens/settings/change-password';

const findInputByPlaceholder = (root: TestRenderer.ReactTestInstance, placeholder: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.placeholder === placeholder);

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('ChangePassword screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the password and returns on success', async () => {
    mockChangePassword.mockResolvedValue({ message: 'password updated' });
    mockSignOut.mockResolvedValue(undefined);

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChangePassword />);
    });

    act(() => {
      findInputByPlaceholder(renderer!.root, 'Current password')?.props.onChangeText('oldpass123');
      findInputByPlaceholder(renderer!.root, 'New password')?.props.onChangeText('newpass123');
      findInputByPlaceholder(renderer!.root, 'Confirm new password')?.props.onChangeText('newpass123');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Change Password')?.props.onPress();
    });

    expect(mockChangePassword).toHaveBeenCalledWith('oldpass123', 'newpass123');
    expect(mockSignOut).toHaveBeenCalledWith('local');
    expect(mockShow).toHaveBeenCalledWith('success', 'Password updated. Please sign in again.');
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('shows an error when the backend update fails', async () => {
    mockChangePassword.mockRejectedValue(new Error('Update failed'));

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ChangePassword />);
    });

    act(() => {
      findInputByPlaceholder(renderer!.root, 'Current password')?.props.onChangeText('oldpass123');
      findInputByPlaceholder(renderer!.root, 'New password')?.props.onChangeText('newpass123');
      findInputByPlaceholder(renderer!.root, 'Confirm new password')?.props.onChangeText('newpass123');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Change Password')?.props.onPress();
    });

    expect(mockShow).toHaveBeenCalledWith('error', 'Update failed');
    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
