import * as Linking from 'expo-linking';

import { ROUTES } from '@/constants/routes';
import ApiService from '@/services/api';

export type BillingOffer = {
  plan_code: string;
  price_inr: number;
  duration_days: number;
  grace_period_days: number;
  referral_bonus_premium_days: number;
};

export type BillingStatus = {
  plan_code?: string | null;
  status: string;
  access_state: 'free' | 'active' | 'grace' | 'inactive' | string;
  active: boolean;
  current_period_start?: string | null;
  current_period_end?: string | null;
  grace_period_ends_at?: string | null;
  offer: BillingOffer;
};

export type BillingCheckoutPayload = {
  success_url: string;
  cancel_url: string;
  referral_code?: string | null;
};

export type BillingCheckoutResponse = {
  checkout_url: string;
  provider_order_id?: string | null;
  provider_reference?: string | null;
  expires_at?: string | null;
  offer: BillingOffer;
};

export type BillingVerifyPayload = {
  provider_order_id: string;
  provider_payment_id: string;
};

class BillingService {
  static async getStatus() {
    return ApiService.get<BillingStatus>('/billing/status');
  }

  static async startCheckout(payload: BillingCheckoutPayload) {
    return ApiService.post<BillingCheckoutResponse, BillingCheckoutPayload>('/billing/checkout', payload);
  }

  static async verifyCheckout(payload: BillingVerifyPayload) {
    return ApiService.post<BillingStatus, BillingVerifyPayload>('/billing/verify', payload);
  }

  static buildReturnUrl() {
    return Linking.createURL(ROUTES.SETTINGS_BILLING.replace(/^\/+/, ''));
  }

  static parseReturnUrl(url: string) {
    const parsed = Linking.parse(url);
    const orderId = parsed.queryParams?.order_id;
    const paymentId = parsed.queryParams?.payment_id;
    return {
      provider_order_id: Array.isArray(orderId) ? orderId[0] : orderId ?? null,
      provider_payment_id: Array.isArray(paymentId) ? paymentId[0] : paymentId ?? null,
    };
  }
}

export default BillingService;
