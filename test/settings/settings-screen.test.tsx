/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { ROUTES } from '@/constants/routes';
import Settings from '@/screens/settings';

const mockLogout = jest.fn();
const mockShow = jest.fn();
const mockHandleIsDark = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    text: '#111111',
    link: '#0a84ff',
    gray: '#808080',
    danger: '#ff453a',
    secondary: '#d1d1d6',
  },
  sizes: {
    padding: 16,
    m: 16,
    md: 20,
    sm: 12,
    s: 8,
    l: 24,
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('@/hooks', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    isDark: false,
    handleIsDark: mockHandleIsDark,
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
    Text: ({ children, ...props }: MockComponentProps) =>
      React.createElement('MockText', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
    Switch: (props: Record<string, unknown>) => React.createElement('MockSwitch', props),
  };
});

const mockedRouter = router as unknown as {
  replace: jest.Mock;
  push: jest.Mock;
  back: jest.Mock;
};

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('Settings screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  it('logs the user out and redirects back to login', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Settings />);
    });

    const logoutButton = findButtonByLabel(renderer!.root, 'Log out');

    expect(logoutButton).toBeDefined();

    await act(async () => {
      await logoutButton?.props.onPress();
    });

    expect(mockLogout).toHaveBeenCalledWith();
    expect(mockShow).toHaveBeenCalledWith('success', 'Logout successful');
    expect(mockedRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it('forwards the dark mode toggle to the data layer', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Settings />);
    });

    const darkModeSwitch = renderer!.root.find((node) => String(node.type) === 'MockSwitch');

    act(() => {
      darkModeSwitch.props.onPress(true);
    });

    expect(mockHandleIsDark).toHaveBeenCalledWith(true);
  });

  it('navigates to premium billing from settings', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Settings />);
    });

    const billingButton = findButtonByLabel(renderer!.root, 'Premium & Billing');

    expect(billingButton).toBeDefined();

    act(() => {
      billingButton?.props.onPress();
    });

    expect(mockedRouter.push).toHaveBeenCalledWith(ROUTES.SETTINGS_BILLING);
  });
});
