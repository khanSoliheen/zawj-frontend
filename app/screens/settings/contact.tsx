import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Block, Button, Image, Text } from "@/components";
import { ROUTES } from "@/constants/routes";
import { useData, useToast } from "@/hooks";
import AuthService from "@/services/auth";

type ContactState = {
  email?: string | null;
  phone?: string | null;
};

export default function ContactSettings() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [state, setState] = useState<ContactState>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await AuthService.getVerificationStatus();
        setState({
          email: data.email,
          phone: data.phone ?? null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load contact details";
        show("error", message);
      }
    })();
  }, [show]);

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <Block paddingVertical={sizes.sm}>
      <Text size={12} color={colors.gray}>{label}</Text>
      <Text p marginTop={4}>{value || "—"}</Text>
    </Block>
  );

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
        <Text h5 semibold>Contact Info</Text>
        <Block width={40} />
      </Block>

      <Block scroll paddingHorizontal={sizes.md} showsVerticalScrollIndicator={false}>
        <Block
          color={colors.card}
          radius={sizes.cardRadius || sizes.sm}
          paddingHorizontal={sizes.m}
          paddingVertical={sizes.sm}
          marginBottom={sizes.m}
        >
          <Row label="Email" value={state.email} />
          <Block height={1} color="rgba(0,0,0,0.08)" />
          <Row label="Phone" value={state.phone || "Not added"} />
        </Block>

        <Text p semibold marginTop={sizes.m} marginBottom={sizes.s}>
          This page shows the contact details currently on your account.
        </Text>
        <Text p marginBottom={sizes.m}>
          If you need a contact detail changed, please reach out to support for now.
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
