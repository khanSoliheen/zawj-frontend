import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { Block, Button, Image, Text } from '@/components';
import { useData, useToast } from '@/hooks';
import SettingsService, { type PhotoAccessRequestRow } from '@/services/settings';

const formatRequestedAt = (value: string) => {
  const requestedAt = new Date(value);
  const diffMs = Date.now() - requestedAt.getTime();

  if (Number.isNaN(requestedAt.getTime()) || diffMs < 0) {
    return 'recently';
  }

  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return requestedAt.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

export default function PhotoRequestsScreen() {
  const { theme } = useData();
  const { show } = useToast();
  const { assets, colors, sizes } = theme;

  const [requests, setRequests] = useState<PhotoAccessRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyViewerId, setBusyViewerId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const rows = await SettingsService.getPhotoRequests();
        if (isMounted) {
          setRequests(rows);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load photo requests';
        if (isMounted) {
          show('error', message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [show]);

  const handleDecision = async (viewerId: string, action: 'approve' | 'reject') => {
    if (busyViewerId) return;
    setBusyViewerId(viewerId);
    try {
      if (action === 'approve') {
        await SettingsService.approvePhotoAccess(viewerId);
        show('success', 'Photo access approved');
      } else {
        await SettingsService.rejectPhotoAccess(viewerId);
        show('info', 'Photo access declined');
      }

      setRequests((current) => current.filter((row) => row.viewer_id !== viewerId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update photo request';
      show('error', message);
    } finally {
      setBusyViewerId(null);
    }
  };

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      <Block row flex={0} align="center" justify="space-between" paddingVertical={sizes.s}>
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
        <Text h5 semibold>Photo Requests</Text>
        <Block width={24} />
      </Block>

      <Block scroll showsVerticalScrollIndicator={false} paddingHorizontal={sizes.md}>
        {loading ? (
          <Block
            color={colors.card}
            radius={sizes.cardRadius || 16}
            padding={sizes.m}
          >
            <Text p>Loading requests…</Text>
          </Block>
        ) : requests.length === 0 ? (
          <Block
            color={colors.card}
            radius={sizes.cardRadius || 16}
            padding={sizes.m}
          >
            <Text p semibold>No pending photo requests</Text>
            <Text p color={colors.gray} marginTop={sizes.xs}>
              New photo access requests will show up here.
            </Text>
          </Block>
        ) : (
          requests.map((request) => (
            <Block
              key={request.viewer_id}
              color={colors.card}
              radius={sizes.cardRadius || 16}
              padding={sizes.m}
              marginBottom={sizes.s}
              shadow
            >
              <Block row align="center">
                <Image
                  source={request.avatar_url ? { uri: request.avatar_url } : assets.avatar1}
                  width={48}
                  height={48}
                  radius={24}
                  marginRight={sizes.s}
                />
                <Block flex={1}>
                  <Text p semibold>{request.full_name || 'User'}</Text>
                  <Text size={12} color={colors.gray} marginTop={2}>
                    Requested access to view your photo
                  </Text>
                  <Text size={12} color={colors.gray} marginTop={2}>
                    {formatRequestedAt(request.requested_at)}
                  </Text>
                </Block>
              </Block>

              <Block row flex={0} marginTop={sizes.m}>
                <Button
                  flex={1}
                  color={colors.primary}
                  shadow={false}
                  paddingVertical={sizes.s}
                  onPress={() => void handleDecision(request.viewer_id, 'approve')}
                  disabled={busyViewerId === request.viewer_id}
                >
                  <Text p semibold color={colors.white}>
                    {busyViewerId === request.viewer_id ? 'Working…' : 'Approve'}
                  </Text>
                </Button>
                <Button
                  flex={1}
                  outlined={colors.gray as string}
                  shadow={false}
                  paddingVertical={sizes.s}
                  marginLeft={sizes.s}
                  onPress={() => void handleDecision(request.viewer_id, 'reject')}
                  disabled={busyViewerId === request.viewer_id}
                >
                  <Text p semibold color={colors.gray}>Decline</Text>
                </Button>
              </Block>
            </Block>
          ))
        )}
      </Block>
    </Block>
  );
}
