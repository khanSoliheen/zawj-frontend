/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockGetVerificationStatus = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    primary: '#111111',
    danger: '#ff453a',
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
    getVerificationStatus: (...args: unknown[]) => mockGetVerificationStatus(...args),
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

import { ROUTES } from '@/constants/routes';
import ContactSettings from '@/screens/settings/contact';

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('ContactSettings screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVerificationStatus.mockResolvedValue({
      email: 'current@example.com',
      phone: '+919999999999',
    });
  });

  it('loads email and phone from verification status', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ContactSettings />);
    });
    await act(async () => {});

    const texts = renderer!.root
      .findAll((node) => String(node.type) === 'MockText')
      .map((node) => node.children.join(''));

    expect(mockGetVerificationStatus).toHaveBeenCalled();
    expect(texts).toContain('Contact Info');
    expect(texts).toContain('current@example.com');
    expect(texts).toContain('+919999999999');
    expect(texts).toContain('Contact support');
  });

  it('navigates to support', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ContactSettings />);
    });
    await act(async () => {});

    act(() => {
      findButtonByLabel(renderer!.root, 'Contact support')?.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith(ROUTES.SUPPORT);
  });
});
