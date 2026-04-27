import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';

import { Block, Button, Image, Text } from '@/components';
import { useAuth, useData, useToast } from '@/hooks';
import BillingService, { type BillingStatus } from '@/services/billing';
import { toUserMessage } from '@/utils/errors';

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRupees = (value: number) => `Rs ${value}`;

export default function BillingScreen() {
  const { theme } = useData();
  const { show } = useToast();
  const { refreshBillingStatus } = useAuth();
  const { colors, sizes, assets, gradients } = theme;
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingCheckout, setStartingCheckout] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const nextStatus = await BillingService.getStatus();
      setStatus(nextStatus);
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to load billing status'));
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useFocusEffect(
    useCallback(() => {
      void loadStatus();
      return undefined;
    }, [loadStatus]),
  );

  const handleCheckout = useCallback(async () => {
    setStartingCheckout(true);
    try {
      const returnUrl = BillingService.buildReturnUrl();
      const response = await BillingService.startCheckout({
        success_url: returnUrl,
        cancel_url: returnUrl,
      });
      const result = await WebBrowser.openAuthSessionAsync(response.checkout_url, returnUrl);
      if (result.type === 'success') {
        const verificationParams = BillingService.parseReturnUrl(result.url);
        if (verificationParams.provider_order_id && verificationParams.provider_payment_id) {
          const nextStatus = await BillingService.verifyCheckout({
            provider_order_id: verificationParams.provider_order_id,
            provider_payment_id: verificationParams.provider_payment_id,
          });
          setStatus(nextStatus);
          setLoading(false);
          await refreshBillingStatus();
          show('success', 'Premium activated');
        } else {
          await loadStatus();
          await refreshBillingStatus();
        }
      }
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to start checkout'));
    } finally {
      setStartingCheckout(false);
    }
  }, [loadStatus, refreshBillingStatus, show]);

  const offer = status?.offer;
  const isSubscribed = status?.access_state === 'active' || status?.access_state === 'grace';
  const primaryCtaLabel = isSubscribed ? 'Renew premium' : 'Upgrade to premium';

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      <Block
        flex={0}
        row
        align="center"
        justify="space-between"
        marginBottom={sizes.sm}
        paddingVertical={sizes.s}
      >
        <Button onPress={() => router.back()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.text}
            source={assets.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
        <Text h5 semibold>Premium & Billing</Text>
        <Block width={24} />
      </Block>

      <Block scroll showsVerticalScrollIndicator={false}>
        <Block
          gradient={gradients.secondary}
          radius={sizes.radius}
          padding={sizes.m}
          marginBottom={sizes.m}
        >
          <Text h4 semibold color={colors.white}>Quarterly Premium</Text>
          <Text p color={colors.white} marginTop={sizes.xs}>
            {offer ? `${formatRupees(offer.price_inr)} every ${offer.duration_days} days` : 'Loading plan...'}
          </Text>
          <Text size={12} color={colors.white} marginTop={sizes.s}>
            Premium is required to send new first-message requests. Existing accepted chats stay available.
          </Text>
        </Block>

        <Block color={colors.card} radius={sizes.radius} padding={sizes.m} marginBottom={sizes.m} shadow>
          <Text h6 semibold marginBottom={sizes.xs}>Current access</Text>
          {loading ? (
            <Text p color={colors.gray}>Loading billing status…</Text>
          ) : (
            <>
              <Text p>
                Status: <Text semibold>{status?.access_state === 'grace' ? 'Grace period' : status?.access_state ?? 'Free'}</Text>
              </Text>
              {isSubscribed ? (
                <Text p semibold color={colors.text} marginTop={sizes.xs}>
                  Premium is active
                </Text>
              ) : null}
              <Text p marginTop={sizes.xs}>
                Current period ends: <Text semibold>{formatDate(status?.current_period_end)}</Text>
              </Text>
              <Text p marginTop={sizes.xs}>
                Grace ends: <Text semibold>{formatDate(status?.grace_period_ends_at)}</Text>
              </Text>
            </>
          )}
        </Block>

        <Block color={colors.card} radius={sizes.radius} padding={sizes.m} marginBottom={sizes.m} shadow>
          <Text h6 semibold marginBottom={sizes.xs}>Referral reward</Text>
          <Text p color={colors.gray}>
            Invite a friend and, when they become a paying subscriber, you receive{' '}
            <Text semibold>{offer?.referral_bonus_premium_days ?? '—'} bonus premium days</Text>.
          </Text>
        </Block>

        <Block color={colors.card} radius={sizes.radius} padding={sizes.m} marginBottom={sizes.l} shadow>
          <Text h6 semibold marginBottom={sizes.xs}>Included with premium</Text>
          <Text p color={colors.gray}>Send new first-message requests.</Text>
          <Text p color={colors.gray} marginTop={sizes.xs}>Keep existing accepted chats available even after expiry.</Text>
          <Text p color={colors.gray} marginTop={sizes.xs}>
            Grace period: {offer?.grace_period_days ?? '—'} days after the quarter ends.
          </Text>

          <Button
            gradient={gradients.primary}
            marginTop={sizes.m}
            onPress={handleCheckout}
            disabled={loading || startingCheckout}
          >
            <Text p semibold color={colors.white}>
              {startingCheckout ? 'Starting checkout…' : primaryCtaLabel}
            </Text>
          </Button>
        </Block>
      </Block>
    </Block>
  );
}
