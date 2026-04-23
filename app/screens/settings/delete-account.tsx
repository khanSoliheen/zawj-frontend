import { router } from 'expo-router';
import React, { useState } from 'react';

import { Block, Button, Image, Input, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useData, useToast } from '@/hooks';
import SessionService from '@/services/session';

export default function DeleteAccount() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);

    try {
      await SessionService.deleteAccount(confirmation);
      show('success', 'Account deleted');
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      show('error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      <Block row flex={0} align="center" justify="space-between" paddingVertical={sizes.s} marginBottom={sizes.sm}>
        <Button onPress={() => router.back()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.link}
            source={assets.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
        <Text h5 semibold>Delete Account</Text>
        <Block width={40} />
      </Block>

      <Block scroll paddingHorizontal={sizes.md} contentContainerStyle={{ paddingBottom: sizes.xl }}>
        <Text p semibold color={colors.danger} marginBottom={sizes.s}>
          This action soft deletes your account and signs you out everywhere.
        </Text>
        <Text p marginBottom={sizes.m}>
          Your account will no longer appear in the app and you will not be able to sign in again with the same email.
        </Text>
        <Text p marginBottom={sizes.s}>
          Type <Text semibold color={colors.danger}>DELETE</Text> to confirm.
        </Text>

        <Input
          placeholder="Type DELETE"
          autoCapitalize="characters"
          autoCorrect={false}
          value={confirmation}
          onChangeText={setConfirmation}
          marginBottom={sizes.m}
        />

        <Button
          color={colors.danger}
          disabled={submitting || confirmation.trim() !== 'DELETE'}
          onPress={handleDelete}
        >
          <Text white semibold>
            {submitting ? 'Deleting...' : 'Delete Account'}
          </Text>
        </Button>

        <Button marginTop={sizes.s} onPress={() => router.back()}>
          <Text p color={colors.link}>Go back</Text>
        </Button>
      </Block>
    </Block>
  );
}
