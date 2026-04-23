/* global jest, describe, it, expect, beforeEach */

import { useRouter } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import Step5 from '@/(auth)/register/step5';
import { ROUTES } from '@/constants/routes';
import SessionService from '@/services/session';

const mockShow = jest.fn();
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};
const mockSetData = jest.fn();
const mockReset = jest.fn();
const mockRegistrationData = {
  email: 'new-user@example.com',
  password: 'secret123',
  first_name: 'Amina',
  last_name: 'Rahman',
};
const mockTheme = {
  colors: {
    background: '#ffffff',
    text: '#111111',
    danger: '#ff453a',
  },
  sizes: {
    s: 8,
    xs: 4,
    md: 20,
    l: 24,
  },
  gradients: {
    primary: ['#111111', '#333333'],
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('@/services/session', () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
}));

jest.mock('@/store/registration', () => ({
  useRegistrationStore: () => ({
    setData: mockSetData,
    data: mockRegistrationData,
    reset: mockReset,
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
    Text: ({ children, ...props }: MockComponentProps) =>
      React.createElement('MockText', props, children),
  };
});

jest.mock('@/components/checkbox', () => {
  const React = require('react');
  return (props: Record<string, unknown>) => React.createElement('MockCheckbox', props);
});

const mockUseRouter = useRouter as unknown as jest.Mock;
const mockSessionService = SessionService as unknown as {
  register: jest.Mock;
  signOut: jest.Mock;
};

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('Register step 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockSessionService.register.mockResolvedValue({
      id: 'user-1',
      email: 'new-user@example.com',
      userMetadata: {},
    });
    mockSessionService.signOut.mockResolvedValue(undefined);
  });

  it('creates the account after both agreements are accepted', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Step5 />);
    });

    const checkboxes = renderer!.root.findAll((node) => String(node.type) === 'MockCheckbox');
    const submitButton = findButtonByLabel(renderer!.root, 'Submit');

    act(() => {
      checkboxes[0]?.props.onPress(true);
      checkboxes[1]?.props.onPress(true);
    });

    await act(async () => {
      await submitButton?.props.onPress();
    });

    expect(mockSetData).toHaveBeenCalledWith({
      terms_accepted: true,
      islamic_policy_accepted: true,
    });
    expect(mockSessionService.register).toHaveBeenCalledWith({
      ...mockRegistrationData,
      terms_accepted: true,
      islamic_policy_accepted: true,
    });
    expect(mockSessionService.signOut).toHaveBeenCalledWith();
    expect(mockReset).toHaveBeenCalled();
    expect(mockShow).toHaveBeenCalledWith('success', 'Account created. Please log in to continue.');
    expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it('shows an error and stops when registration fails', async () => {
    mockSessionService.register.mockRejectedValue(new Error('Unable to create the account.'));

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Step5 />);
    });

    const checkboxes = renderer!.root.findAll((node) => String(node.type) === 'MockCheckbox');
    const submitButton = findButtonByLabel(renderer!.root, 'Submit');

    act(() => {
      checkboxes[0]?.props.onPress(true);
      checkboxes[1]?.props.onPress(true);
    });

    await act(async () => {
      await submitButton?.props.onPress();
    });

    expect(mockShow).toHaveBeenCalledWith('error', 'Unable to create the account.');
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });
});
