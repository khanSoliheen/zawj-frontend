import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Block, Button, Text, Image, Switch } from "@/components";
import { useData, useToast } from "@/hooks";
import SettingsService, { type NotificationPrefs as Prefs } from "@/services/settings";

const DEFAULTS: Prefs = { push: true, messages: true, matches: true, marketing: false, sounds: false };

export default function NotificationSettings() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  // Load from user metadata
  useEffect(() => {
    (async () => {
      try {
        const response = await SettingsService.getNotificationSettings();
        setPrefs({
          push: response?.push ?? DEFAULTS.push,
          messages: response?.messages ?? DEFAULTS.messages,
          matches: response?.matches ?? DEFAULTS.matches,
          marketing: response?.marketing ?? DEFAULTS.marketing,
          sounds: response?.sounds ?? DEFAULTS.sounds,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load notifications";
        show("error", message);
      }
    })();
  }, [show]);

  const save = async (next: Prefs) => {
    if (saving) return;
    setSaving(true);
    try {
      await SettingsService.updateNotificationSettings(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save notifications";
      setSaving(false);
      show("error", message);
      return;
    }
    setSaving(false);
    show("success", "Notification preferences saved");
  };

  const toggle = (key: keyof Prefs) => (checked: boolean) => {
    const next = { ...prefs, [key]: checked };
    setPrefs(next);           // optimistic
    void save(next);
  };

  const Row = ({
    label,
    help,
    value,
    onChange,
  }: {
    label: string;
    help?: string;
    value: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <Block row justify="space-between" align="center" paddingVertical={sizes.sm}>
      <Block>
        <Text p semibold>{label}</Text>
        {help ? <Text size={12} color={colors.gray}>{help}</Text> : null}
      </Block>
      <Switch
        id={`${label.replace(/\s+/g, "-").toLowerCase()}-toggle`}
        inactiveFillColor={colors.secondary}
        checked={value}
        onPress={onChange}
      />
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
        <Text h5 semibold>Notifications</Text>
        <Block width={40} />
      </Block>

      {/* Toggles */}
      <Block paddingHorizontal={sizes.md}>
        <Row
          label="Push notifications"
          help="General updates and alerts"
          value={prefs.push}
          onChange={toggle("push")}
        />
        <Row
          label="New messages"
          help="Real-time chat notifications"
          value={prefs.messages}
          onChange={toggle("messages")}
        />
        <Row
          label="New matches"
          help="Alerts when a connection request is accepted and you become a match"
          value={prefs.matches}
          onChange={toggle("matches")}
        />
        <Row
          label="Marketing"
          help="Product updates, campaigns, and non-essential announcements"
          value={prefs.marketing}
          onChange={toggle("marketing")}
        />
        <Row
          label="In-app sounds"
          help="Play sound cues for in-app alerts and actions"
          value={prefs.sounds}
          onChange={toggle("sounds")}
        />
      </Block>

      {/* Save hint */}
      <Block marginTop={sizes.sm}>
        <Text size={12} color={colors.gray}>
          Changes are saved automatically{saving ? "…" : "."}
        </Text>
      </Block>
    </Block>
  );
}
