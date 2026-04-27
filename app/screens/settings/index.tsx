import { router } from "expo-router";
import React from "react";

import { Block, Button, Text, Image, Switch } from "@/components";
import { ROUTES } from '@/constants/routes';
import { useAuth, useData, useToast } from "@/hooks";

interface SettingItemProps {
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function Settings() {
  const { logout } = useAuth();
  const { show } = useToast();
  const { isDark, handleIsDark, theme } = useData();
  const { colors, sizes, assets } = theme;

  const logoutHandler = async () => {
    await logout();
    show("success", "Logout successful");
    router.replace(ROUTES.LOGIN);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text h6 semibold marginTop={sizes.m} marginBottom={sizes.s} color={colors.text}>
      {title}
    </Text>
  );

  const Arrow = () => (
    <Image
      radius={0}
      width={10}
      height={18}
      color={colors.gray}
      source={assets.arrow}
    />
  );

  const SettingItem = ({ label, onPress, danger = false }: SettingItemProps) => (
    <Button
      row
      justify="space-between"
      align="center"
      paddingVertical={sizes.sm}
      onPress={onPress}
    >
      <Text p color={danger ? colors.danger : colors.text}>
        {label}
      </Text>
      {!danger && <Arrow />}
    </Button>
  );

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      {/* Header */}
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
            transform={[{ rotate: "180deg" }]}
          />
        </Button>
        <Text h5 semibold>
          Settings
        </Text>
        <Block width={24} />
      </Block>

      {/* Settings list */}
      <Block scroll paddingHorizontal={sizes.md} showsVerticalScrollIndicator={false}>
        {/* 🧍 Account Settings */}
        <SectionHeader title="Account Settings" />
        <SettingItem label="Edit Profile" onPress={() => router.push(ROUTES.SETTINGS_EDIT)} />
        <SettingItem label="Change Password" onPress={() => router.push(ROUTES.SETTINGS_CHANGE_PASSWORD)} />
        <SettingItem label="Email & Phone" onPress={() => router.push(ROUTES.SETTINGS_CONTACT)} />
        {/*<SettingItem label="Verification Status" onPress={() => alert("Verification Status")} />*/}
        <SettingItem label="Profile Visibility" onPress={() => router.push(ROUTES.SETTINGS_VISIBILITY)} />
        <SettingItem label="Photo Requests" onPress={() => router.push(ROUTES.SETTINGS_PHOTO_REQUESTS)} />

        {/* ❤️ Preferences */}
        <SectionHeader title="Match & Preferences" />
        <SettingItem label="Match Preferences" onPress={() => router.push(ROUTES.PREFERENCES)} />
        <SettingItem label="Premium & Billing" onPress={() => router.push(ROUTES.SETTINGS_BILLING)} />
        <SettingItem label="Notifications" onPress={() => router.push(ROUTES.SETTINGS_NOTIFICATIONS)} />
        <Block
          row
          justify="space-between"
          align="center"
          paddingVertical={sizes.sm}
        >
          <Text p>Dark Mode</Text>
          <Switch
            id="darkModeToggle"
            inactiveFillColor={colors.secondary}
            checked={isDark}
            onPress={(checked) => handleIsDark(checked)}
          />
        </Block>

        {/* 🔒 Privacy & Security */}
        <SectionHeader title="Privacy & Security" />
        <SettingItem label="Verification" onPress={() => router.push(ROUTES.SETTINGS_VERIFICATION)} />
        <SettingItem label="Two-Step Verification" onPress={() => router.push(ROUTES.SETTINGS_TWO_FACTOR)} />
        <SettingItem label="Blocked Users" onPress={() => router.push(ROUTES.SETTINGS_BLOCKED_USERS)} />
        <SettingItem label="Devices & Sessions" onPress={() => router.push(ROUTES.SETTINGS_SESSION)} />
        <SettingItem label="Delete Account" onPress={() => router.push(ROUTES.SETTINGS_DELETE_ACCOUNT)} danger />

        {/* 🕌 Faith & Community */}
        <SectionHeader title="Faith & Community" />
        <SettingItem label="Islamic Policy" onPress={() => router.push(ROUTES.SETTINGS_POLICY)} />
        <SettingItem label="Report Misconduct" onPress={() => router.push(ROUTES.SETTINGS_REPORT)} />
        <SettingItem label="FAQ" onPress={() => router.push(ROUTES.SETTINGS_FAQ)} />
        <SettingItem label="About Zawj" onPress={() => router.push(ROUTES.SETTINGS_ABOUT)} />

        {/* 🚪 Logout */}
        {/*<SectionHeader title="Logout" />*/}
        <SettingItem label="Log out" danger onPress={logoutHandler} />

        <Block height={sizes.l} />
      </Block>
    </Block>
  );
}
