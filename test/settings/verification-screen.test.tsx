/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    success: '#30d158',
    danger: '#ff453a',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    md: 20,
  },
  assets: {
    arrow: 1,
  },
};
const mockGetVerificationStatus = jest.fn();

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
  };
});

const VerificationStatus = require('@/screens/settings/verification').default as typeof import('@/screens/settings/verification').default;

describe('VerificationStatus screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVerificationStatus.mockResolvedValue({
      email: 'verify@example.com',
      email_verified: false,
      phone: '+919999999999',
      phone_verification_enabled: false,
    });
  });

  it('loads verification status from the backend service', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<VerificationStatus />);
    });
    await act(async () => {});

    const texts = renderer!.root
      .findAll((node) => String(node.type) === 'MockText')
      .map((node) => node.children.join(''));

    expect(mockGetVerificationStatus).toHaveBeenCalled();
    expect(texts).toContain('Verification Status');
    expect(texts).toContain('verify@example.com');
    expect(texts).toContain('+919999999999');
    expect(texts).toContain('Unverified');
  });

  it('shows a toast when the backend lookup fails', async () => {
    mockGetVerificationStatus.mockRejectedValue(new Error('Failed to load verification status'));

    await act(async () => {
      TestRenderer.create(<VerificationStatus />);
    });
    await act(async () => {});

    expect(mockShow).toHaveBeenCalledWith('error', 'Failed to load verification status');
  });
});
