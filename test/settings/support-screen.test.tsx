/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import ContactSupport from '@/screens/support';

const mockShow = jest.fn();
const mockCreateSupportTicket = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    primary: '#111111',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
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

jest.mock('@/services/settings', () => ({
  __esModule: true,
  default: {
    createSupportTicket: (...args: unknown[]) => mockCreateSupportTicket(...args),
  },
}));

jest.mock('@/services/session', () => ({
  __esModule: true,
  default: {
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
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

const findInputByPlaceholder = (root: TestRenderer.ReactTestInstance, placeholder: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.placeholder === placeholder);

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('ContactSupport screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: 'support-user',
      email: 'support@example.com',
    });
    mockCreateSupportTicket.mockResolvedValue({ message: 'ok' });
  });

  it('submits a support ticket successfully', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ContactSupport />);
    });
    await act(async () => {});

    act(() => {
      findInputByPlaceholder(renderer!.root, 'Subject')?.props.onChangeText('Need help');
      findInputByPlaceholder(renderer!.root, 'Describe your issue or question…')?.props.onChangeText('This is a detailed support request message.');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Send')?.props.onPress();
    });

    expect(mockCreateSupportTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Need help',
        message: 'This is a detailed support request message.',
        email: 'support@example.com',
      }),
    );
    expect(mockShow).toHaveBeenCalledWith('success', 'Thanks! We’ve received your message.');
    expect(router.back).toHaveBeenCalled();
  });
});
