import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';

import { Block, Button, Image, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useData } from '@/hooks';

const getBuildValue = () => {
  const iosBuild = Constants.expoConfig?.ios?.buildNumber;
  const androidBuild = Constants.expoConfig?.android?.versionCode;

  if (iosBuild) {
    return iosBuild;
  }

  if (androidBuild) {
    return String(androidBuild);
  }

  return 'Development';
};

const getBundleValue = () =>
  Constants.expoConfig?.ios?.bundleIdentifier ??
  Constants.expoConfig?.android?.package ??
  'Not configured';

const getOwnerValue = () => Constants.expoConfig?.owner ?? 'Zawj Team';
const getVersionValue = () => Constants.expoConfig?.version ?? '1.0.0';
const getAppName = () => Constants.expoConfig?.name ?? 'Zawj';

export default function AboutScreen() {
  const { theme } = useData();
  const { colors, sizes, assets } = theme;
  const appName = getAppName();

  const Row = ({ label, value }: { label: string; value: string }) => (
    <Block
      row
      align="center"
      justify="space-between"
      paddingVertical={sizes.s}
      style={{
        borderBottomColor: colors.secondary,
        borderBottomWidth: 1,
      }}
    >
      <Text size={12} color={colors.gray}>
        {label}
      </Text>
      <Text p semibold style={{ maxWidth: '60%', textAlign: 'right' }}>
        {value}
      </Text>
    </Block>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Block marginTop={sizes.m}>
      <Text p semibold marginBottom={sizes.s}>
        {title}
      </Text>
      {children}
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
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
        <Text h5 semibold>About</Text>
        <Block width={40} />
      </Block>

      <Block scroll paddingHorizontal={sizes.md} contentContainerStyle={{ paddingBottom: sizes.xl }}>
        <Block
          padding={sizes.m}
          radius={sizes.cardRadius}
          color={colors.card}
          style={{
            borderColor: colors.secondary,
            borderWidth: 1,
          }}
        >
          <Text h4 semibold marginBottom={sizes.xs}>
            {appName}
          </Text>
          <Text p color={colors.gray}>
            A marriage-focused app built to support intentional, respectful, and Shariah-conscious connections.
          </Text>
        </Block>

        <Section title="App Details">
          <Block
            paddingHorizontal={sizes.m}
            radius={sizes.cardRadius}
            color={colors.card}
            style={{
              borderColor: colors.secondary,
              borderWidth: 1,
            }}
          >
            <Row label="Version" value={getVersionValue()} />
            <Row label="Build" value={getBuildValue()} />
            <Row label="Owner" value={getOwnerValue()} />
            <Row label="Package" value={getBundleValue()} />
          </Block>
        </Section>

        <Section title="What Zawj Focuses On">
          <Block
            padding={sizes.m}
            radius={sizes.cardRadius}
            color={colors.card}
            style={{
              borderColor: colors.secondary,
              borderWidth: 1,
            }}
          >
            <Text p marginBottom={sizes.s}>
              Zawj is designed for users who want a clear, modest, and marriage-oriented experience rather than casual dating.
            </Text>
            <Text p marginBottom={sizes.s}>
              The current app includes profile discovery, chat, privacy controls, blocking, reporting, and account settings.
            </Text>
            <Text p color={colors.gray}>
              More trust, verification, and account-management features can be layered in without changing the core experience.
            </Text>
          </Block>
        </Section>

        <Section title="Helpful Links">
          <Button onPress={() => router.push(ROUTES.SETTINGS_POLICY)}>
            <Text p semibold color={colors.link}>Islamic Policy</Text>
          </Button>

          <Button marginTop={sizes.s} onPress={() => router.push(ROUTES.SUPPORT)}>
            <Text p semibold color={colors.link}>Contact Support</Text>
          </Button>
        </Section>
      </Block>
    </Block>
  );
}
