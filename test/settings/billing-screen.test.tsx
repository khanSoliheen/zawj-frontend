/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockOpenAuthSessionAsync = jest.fn();
const mockGetStatus = jest.fn();
const mockStartCheckout = jest.fn();
const mockVerifyCheckout = jest.fn();
const mockParseReturnUrl = jest.fn();
const mockBuildReturnUrl = jest.fn();
const mockUseFocusEffect = jest.fn();
const mockRefreshBillingStatus = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    card: '#f5f5f5',
    gray: '#808080',
    text: '#111111',
    white: '#ffffff',
  },
  sizes: {
    padding: 16,
    radius: 12,
    s: 8,
    xs: 4,
    sm: 12,
    m: 16,
    l: 24,
  },
  gradients: {
    primary: ['#111111', '#222222'],
    secondary: ['#ff4db8', '#7c3aed'],
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('expo-web-browser', () => ({
  __esModule: true,
  openAuthSessionAsync: (...args: unknown[]) => mockOpenAuthSessionAsync(...args),
}));

jest.mock('@react-navigation/native', () => ({
  __esModule: true,
  useFocusEffect: (effect: () => void | (() => void)) => mockUseFocusEffect(effect),
}));

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
  useAuth: () => ({
    refreshBillingStatus: mockRefreshBillingStatus,
  }),
}));

jest.mock('@/services/billing', () => ({
  __esModule: true,
  default: {
    getStatus: (...args: unknown[]) => mockGetStatus(...args),
    startCheckout: (...args: unknown[]) => mockStartCheckout(...args),
    verifyCheckout: (...args: unknown[]) => mockVerifyCheckout(...args),
    parseReturnUrl: (...args: unknown[]) => mockParseReturnUrl(...args),
    buildReturnUrl: (...args: unknown[]) => mockBuildReturnUrl(...args),
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

import BillingScreen from '@/screens/settings/billing';

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('Billing screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildReturnUrl.mockReturnValue('zawj://screens/settings/billing');
    mockGetStatus.mockResolvedValue({
      plan_code: 'premium_quarterly',
      status: 'free',
      access_state: 'free',
      active: false,
      current_period_start: null,
      current_period_end: null,
      grace_period_ends_at: null,
      offer: {
        plan_code: 'premium_quarterly',
        price_inr: 500,
        duration_days: 90,
        grace_period_days: 3,
        referral_bonus_premium_days: 30,
      },
    });
    mockStartCheckout.mockResolvedValue({
      checkout_url: 'https://payments.example.com/checkout/session-1',
      offer: {
        plan_code: 'premium_quarterly',
        price_inr: 500,
        duration_days: 90,
        grace_period_days: 3,
        referral_bonus_premium_days: 30,
      },
    });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'zawj://screens/settings/billing?order_id=order_123&payment_id=pay_123',
    });
    mockParseReturnUrl.mockReturnValue({
      provider_order_id: 'order_123',
      provider_payment_id: 'pay_123',
    });
    mockVerifyCheckout.mockResolvedValue({
      plan_code: 'premium_quarterly',
      status: 'active',
      access_state: 'active',
      active: true,
      current_period_start: '2026-04-25T00:00:00.000Z',
      current_period_end: '2026-07-24T00:00:00.000Z',
      grace_period_ends_at: '2026-07-27T00:00:00.000Z',
      offer: {
        plan_code: 'premium_quarterly',
        price_inr: 500,
        duration_days: 90,
        grace_period_days: 3,
        referral_bonus_premium_days: 30,
      },
    });
    mockRefreshBillingStatus.mockResolvedValue(undefined);
  });

  it('loads billing status and starts checkout', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<BillingScreen />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const initialStatusCallCount = mockGetStatus.mock.calls.length;
    expect(initialStatusCallCount).toBeGreaterThan(0);

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Upgrade to premium')?.props.onPress();
    });

    expect(mockStartCheckout).toHaveBeenCalledWith({
      success_url: 'zawj://screens/settings/billing',
      cancel_url: 'zawj://screens/settings/billing',
    });
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      'https://payments.example.com/checkout/session-1',
      'zawj://screens/settings/billing',
    );
    expect(mockParseReturnUrl).toHaveBeenCalledWith(
      'zawj://screens/settings/billing?order_id=order_123&payment_id=pay_123',
    );
    expect(mockVerifyCheckout).toHaveBeenCalledWith({
      provider_order_id: 'order_123',
      provider_payment_id: 'pay_123',
    });
    expect(mockRefreshBillingStatus).toHaveBeenCalled();
    expect(mockShow).toHaveBeenCalledWith('success', 'Premium activated');
    expect(mockGetStatus.mock.calls.length).toBe(initialStatusCallCount);
  });

  it('shows an error when checkout fails', async () => {
    mockStartCheckout.mockRejectedValue(new Error('Checkout unavailable'));

    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<BillingScreen />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Upgrade to premium')?.props.onPress();
    });

    expect(mockShow).toHaveBeenCalledWith('error', 'Checkout unavailable');
    expect(mockOpenAuthSessionAsync).not.toHaveBeenCalled();
  });

  it('does not reload billing status when the auth session is dismissed', async () => {
    mockOpenAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<BillingScreen />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const initialStatusCallCount = mockGetStatus.mock.calls.length;
    expect(initialStatusCallCount).toBeGreaterThan(0);

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Upgrade to premium')?.props.onPress();
    });

    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      'https://payments.example.com/checkout/session-1',
      'zawj://screens/settings/billing',
    );
    expect(mockVerifyCheckout).not.toHaveBeenCalled();
    expect(mockGetStatus.mock.calls.length).toBe(initialStatusCallCount);
  });

  it('returns to the previous screen from the header', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<BillingScreen />);
    });

    const backButton = renderer!.root.findAll((node) => String(node.type) === 'MockButton')[0];

    act(() => {
      backButton.props.onPress();
    });

    expect(router.back).toHaveBeenCalled();
  });
});
