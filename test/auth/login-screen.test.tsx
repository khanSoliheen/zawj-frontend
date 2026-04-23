/* global jest, describe, it, expect, beforeEach */

import { useRouter } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import Login from '@/(auth)/login';
import { ROUTES } from '@/constants/routes';

const mockLogin = jest.fn();
const mockShow = jest.fn();
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
  },
  gradients: {
    primary: ['#111111', '#333333'],
  },
  sizes: {
    md: 20,
    s: 8,
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('@/hooks', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & {
    children?: unknown;
  };

  return {
    Block: ({ children, ...props }: MockComponentProps) =>
      React.createElement('MockBlock', props, children),
    Button: ({ children, ...props }: MockComponentProps) =>
      React.createElement('MockButton', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
    Text: ({ children, ...props }: MockComponentProps) =>
      React.createElement('MockText', props, children),
  };
});

const mockUseRouter = useRouter as unknown as jest.Mock;

const findInputById = (root: TestRenderer.ReactTestInstance, id: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.id === id);

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('Login screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it('submits valid credentials and redirects to users on success', async () => {
    mockLogin.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      userMetadata: {},
    });

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Login />);
    });

    const emailInput = findInputById(renderer!.root, 'email');
    const passwordInput = findInputById(renderer!.root, 'password');
    const loginButton = findButtonByLabel(renderer!.root, 'Login');

    act(() => {
      emailInput?.props.onChangeText('user@example.com');
      passwordInput?.props.onChangeText('secret123');
    });

    await act(async () => {
      await loginButton?.props.onPress();
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'You have successfully logged in.');
    expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.USERS);
  });

  it('shows an error toast when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Login />);
    });

    const emailInput = findInputById(renderer!.root, 'email');
    const passwordInput = findInputById(renderer!.root, 'password');
    const loginButton = findButtonByLabel(renderer!.root, 'Login');

    act(() => {
      emailInput?.props.onChangeText('user@example.com');
      passwordInput?.props.onChangeText('wrongpass');
    });

    await act(async () => {
      await loginButton?.props.onPress();
    });

    expect(mockShow).toHaveBeenCalledWith('error', 'Invalid credentials');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
