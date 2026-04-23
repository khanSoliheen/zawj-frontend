import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Block, Button, Text, Image } from "@/components";
import { useData, useToast } from "@/hooks";
import AuthService from "@/services/auth";

type VerifState = {
  email?: string | null;
  emailVerified?: boolean;
  phone?: string | null;
  phoneVerified?: boolean;
};

export default function VerificationStatus() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [state, setState] = useState<VerifState>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await AuthService.getVerificationStatus();
        setState({
          email: data.email,
          emailVerified: data.email_verified,
          phone: data.phone ?? null,
          phoneVerified: data.phone_verification_enabled,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load verification status";
        show("error", message);
      }
    })();
  }, [show]);

  const emailVerified = !!state.emailVerified;
  const phoneVerified = !!state.phoneVerified;

  const Row = ({
    label,
    value,
    verified,
    help,
  }: {
    label: string;
    value?: string | null;
    verified: boolean;
    help?: string;
  }) => (
    <Block paddingVertical={sizes.sm}>
      <Block row align="center" justify="space-between">
        <Block>
          <Text p semibold>{label}</Text>
          {value ? <Text size={12} color={colors.gray}>{value}</Text> : null}
          {help ? <Text size={12} color={colors.gray}>{help}</Text> : null}
        </Block>
        <Text p semibold color={verified ? colors.success : colors.danger}>
          {verified ? "Verified" : "Unverified"}
        </Text>
      </Block>
    </Block>
  );

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      {/* Header */}
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
        <Text h5 semibold>Verification Status</Text>
        <Block width={40} />
      </Block>

      {/* Items */}
      <Block scroll paddingHorizontal={sizes.md} showsVerticalScrollIndicator={false}>
        <Text p semibold marginBottom={sizes.s}>
          This page shows the current verification status on your account.
        </Text>
        <Text p color={colors.gray} marginBottom={sizes.m}>
          Verification actions are not available in the app yet, so this screen is informational for now.
        </Text>

        <Row
          label="Email"
          value={state.email || ""}
          verified={emailVerified}
          help={!emailVerified ? "Your account email is currently marked as unverified." : undefined}
        />

        <Block height={1} color="rgba(0,0,0,0.08)" />

        <Row
          label="Phone"
          value={state.phone || "Not added"}
          verified={phoneVerified}
          help={!phoneVerified ? "Your phone number is not currently verified." : undefined}
        />

        <Text size={12} color={colors.gray} marginTop={sizes.m}>
          If you need help with verification, contact support.
        </Text>

        <Block height={sizes.l} />
      </Block>
    </Block>
  );
}
