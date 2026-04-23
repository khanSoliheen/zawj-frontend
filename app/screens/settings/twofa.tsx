import { router } from "expo-router";
import React from "react";

import { Block, Button, Image, Text } from "@/components";
import { ROUTES } from "@/constants/routes";
import { useData } from "@/hooks";

export default function TwoFactorSettings() {
  const { theme } = useData();
  const { colors, sizes, assets } = theme;

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
            transform={[{ rotate: "180deg" }]}
          />
        </Button>
        <Text h5 semibold>Two-Step Verification</Text>
        <Block width={40} />
      </Block>

      <Block scroll paddingHorizontal={sizes.md} showsVerticalScrollIndicator={false}>
        <Text p semibold marginBottom={sizes.s}>
          This page shows the current two-step verification status for your account.
        </Text>
        <Text p marginBottom={sizes.m}>
          Two-step verification is not available in the app yet, so there are no setup actions on this screen for now.
        </Text>

        <Button color={colors.primary} onPress={() => router.push(ROUTES.SUPPORT)}>
          <Text white semibold>Contact support</Text>
        </Button>

        <Button marginTop={sizes.s} onPress={() => router.back()}>
          <Text p color={colors.link}>Go back</Text>
        </Button>

        <Block height={sizes.l} />
      </Block>
    </Block>
  );
}
