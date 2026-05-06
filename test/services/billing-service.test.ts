/* global jest, describe, it, expect, beforeEach */

const mockCreateUrl = jest.fn();
const mockParse = jest.fn();

jest.mock('expo-linking', () => ({
  __esModule: true,
  createURL: (...args: unknown[]) => mockCreateUrl(...args),
  parse: (...args: unknown[]) => mockParse(...args),
}));

import BillingService from '@/services/billing';

describe('BillingService.buildReturnUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUrl.mockReturnValue('zawjapp://screens/settings/billing');
    mockParse.mockReturnValue({
      queryParams: {
        order_id: 'order_123',
        payment_id: 'pay_123',
      },
    });
  });

  it('builds a browser-safe deep link without a leading slash', () => {
    const url = BillingService.buildReturnUrl();

    expect(mockCreateUrl).toHaveBeenCalledWith('screens/settings/billing');
    expect(url).toBe('zawjapp://screens/settings/billing');
  });

  it('parses payment ids from the return URL', () => {
    const result = BillingService.parseReturnUrl(
      'zawjapp://screens/settings/billing?order_id=order_123&payment_id=pay_123',
    );

    expect(mockParse).toHaveBeenCalledWith(
      'zawjapp://screens/settings/billing?order_id=order_123&payment_id=pay_123',
    );
    expect(result).toEqual({
      provider_order_id: 'order_123',
      provider_payment_id: 'pay_123',
    });
  });
});
