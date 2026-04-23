import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { Block, Button, Image, Text } from '@/components';
import { useData, useToast } from '@/hooks';
import SettingsService, { type PhotoAccessRequestRow } from '@/services/settings';

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
          <Text p>Loading requests…</Text>
        ) : requests.length === 0 ? (
          <Text p color={colors.gray}>No pending photo requests.</Text>
        ) : (
          requests.map((request) => (
            <Block key={request.viewer_id} row align="center" justify="space-between" paddingVertical={sizes.sm}>
              <Block row flex={0} align="center">
                <Image
                  source={request.avatar_url ? { uri: request.avatar_url } : assets.avatar1}
                  width={40}
                  height={40}
                  radius={20}
                  marginRight={sizes.s}
                />
                <Block flex={0}>
                  <Text p semibold>{request.full_name || 'User'}</Text>
                  <Text size={12} color={colors.gray}>Requested access to view your photo</Text>
                </Block>
              </Block>

              <Block row flex={0} align="center">
                <Button
                  onPress={() => void handleDecision(request.viewer_id, 'approve')}
                  disabled={busyViewerId === request.viewer_id}
                  marginRight={sizes.s}
                >
                  <Text p semibold color={colors.primary}>Approve</Text>
                </Button>
                <Button
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
