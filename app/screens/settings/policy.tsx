import { router } from "expo-router";
import React from "react";

import { Block, Button, Text, Image } from "@/components";
import { ROUTES } from '@/constants/routes';
import { useData } from "@/hooks";

export default function IslamicPolicy() {
  const { theme } = useData();
  const { colors, sizes, assets } = theme;

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <Block row align="flex-start" marginBottom={sizes.s}>
      <Text p style={{ marginRight: 8 }}>•</Text>
      <Block flex={1}>
        <Text p>{children}</Text>
      </Block>
    </Block>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Block
      marginTop={sizes.m}
      padding={sizes.m}
      radius={sizes.cardRadius}
      color={colors.card}
      style={{
        borderColor: colors.secondary,
        borderWidth: 1,
      }}
    >
      <Text p semibold>{title}</Text>
      <Block marginTop={sizes.s}>{children}</Block>
    </Block>
  );

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      {/* Header */}
      <Block
        row
        flex={0}
        align="center"
        justify="space-between"
        paddingVertical={sizes.s}
        marginBottom={sizes.sm}
      >
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
        <Text h5 semibold>Islamic Policy</Text>
        <Block width={40} />
      </Block>

      <Block scroll paddingHorizontal={sizes.md} contentContainerStyle={{ paddingBottom: sizes.xl }}>
        <Text p color={colors.gray}>
          Zawj follows guidelines intended to uphold Shariah-compliant conduct and privacy.
        </Text>

        <Section title="Core Principles">
          <Bullet>Purpose of the platform is nikah/marriage, not casual dating.</Bullet>
          <Bullet>Respectful, modest communication at all times; no vulgarity or harassment.</Bullet>
          <Bullet>Truthful profiles only; misrepresentation or impersonation is prohibited.</Bullet>
          <Bullet>Privacy first: share sensitive information only as needed and with consent.</Bullet>
        </Section>

        <Section title="Interactions">
          <Bullet>No explicit images or content; profile photos must be modest.</Bullet>
          <Bullet>Do not pressure for private meetings or exchanges beyond platform norms.</Bullet>
          <Bullet>Use in-app reporting for misconduct, scams, or unethical behavior.</Bullet>
        </Section>

        <Section title="Prohibited Conduct">
          <Bullet>Lewd language, harassment, stalking, or blackmail.</Bullet>
          <Bullet>Solicitation, commercial advertising, or escorting.</Bullet>
          <Bullet>Hate speech, sectarian abuse, or derogatory remarks.</Bullet>
          <Bullet>Sharing others’ private information without consent.</Bullet>
        </Section>

        <Section title="Enforcement">
          <Bullet>Reports are reviewed; accounts may be warned, suspended, or banned.</Bullet>
          <Bullet>Severe or repeated violations lead to permanent removal.</Bullet>
          <Bullet>We may notify authorities where legally required.</Bullet>
        </Section>

        <Section title="Your Tools">
          <Bullet>
            <Text p>
              Use <Text semibold>Report Misconduct</Text> to flag issues you encounter.
            </Text>
          </Bullet>
          <Bullet>
            <Text p>
              Manage who can contact you in <Text semibold>Profile Visibility</Text>.
            </Text>
          </Bullet>
          <Bullet>
            <Text p>
              Block users anytime from profiles or via <Text semibold>Blocked Users</Text>.
            </Text>
          </Bullet>
        </Section>

        <Block marginTop={sizes.m}>
          <Button onPress={() => router.push(ROUTES.SETTINGS_REPORT)}>
            <Text p semibold color={colors.link}>Report Misconduct</Text>
          </Button>
        </Block>
      </Block>
    </Block>
  );
}
