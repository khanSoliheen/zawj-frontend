import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Block, Button, Text, Image, Switch, SelectInput } from "@/components";
import { ROUTES } from '@/constants/routes';
import { useData, useToast } from "@/hooks";
import SettingsService, { type VisibilityPrefs } from "@/services/settings";

type BooleanVisibilityKey = 'discoverable' | 'read_receipts';

const DEFAULTS: VisibilityPrefs = {
  discoverable: true,
  messages_from: "matches",
  read_receipts: true,
  photo_visibility: "approved_only",
};

export default function ProfileVisibilitySettings() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [prefs, setPrefs] = useState<VisibilityPrefs>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  // Load from user metadata
  useEffect(() => {
    (async () => {
      try {
        const response = await SettingsService.getVisibilitySettings();
        setPrefs({
          discoverable: response?.discoverable ?? DEFAULTS.discoverable,
          messages_from: response?.messages_from ?? DEFAULTS.messages_from,
          read_receipts: response?.read_receipts ?? DEFAULTS.read_receipts,
          photo_visibility: response?.photo_visibility ?? DEFAULTS.photo_visibility,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load privacy settings";
        show("error", message);
      }
    })();
  }, [show]);

  const save = async (next: VisibilityPrefs) => {
    if (saving) return;
    setSaving(true);
    try {
      await SettingsService.updateVisibilitySettings(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save privacy settings";
      setSaving(false);
      show("error", message);
      return;
    }
    setSaving(false);
    show("success", "Privacy updated");
  };

  const setToggle = (key: BooleanVisibilityKey) => (checked: boolean) => {
    const next: VisibilityPrefs = { ...prefs, [key]: checked };
    setPrefs(next);
    void save(next);
  };

  const setMessagesFrom = (value: "everyone" | "matches") => {
    const next = { ...prefs, messages_from: value };
    setPrefs(next);
    void save(next);
  };

  const setPhotoVisibility = (value: VisibilityPrefs['photo_visibility']) => {
    const next = { ...prefs, photo_visibility: value };
    setPrefs(next);
    void save(next);
  };

  const Row = ({
    label,
    help,
    right,
  }: {
    label: string;
    help?: string;
    right: React.ReactNode;
  }) => (
    <Block row justify="space-between" align="center" paddingVertical={sizes.sm}>
      <Block>
        <Text p semibold>{label}</Text>
        {help ? <Text size={12} color={colors.gray}>{help}</Text> : null}
      </Block>
      {right}
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
        <Text h5 semibold>Profile Visibility</Text>
        <Block width={40} />
      </Block>

      {/* Toggles / Options */}
      <Block
        scroll
        paddingHorizontal={sizes.md}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.l }}
      >
        <Row
          label="Show my profile in search"
          help="Allow others to discover you in search and explore"
          right={
            <Switch
              id="discoverable-toggle"
              inactiveFillColor={colors.secondary}
              checked={prefs.discoverable}
              onPress={setToggle("discoverable")}
            />
          }
        />

        <Block flex={0} paddingVertical={sizes.sm}>
          <Text p semibold>Allow messages from</Text>
          <Text size={12} color={colors.gray} marginBottom={sizes.xs}>
            Who can start a conversation with you
          </Text>
          <SelectInput
            label=""
            placeholder="Select who can message you"
            value={prefs.messages_from === 'matches' ? 'Matches only' : 'Everyone'}
            options={['Matches only', 'Everyone']}
            onChange={(value) => setMessagesFrom(value === 'Matches only' ? 'matches' : 'everyone')}
          />
        </Block>

        <Row
          label="Read receipts"
          help="Let others see when you’ve read their messages"
          right={
            <Switch
              id="read-receipts-toggle"
              inactiveFillColor={colors.secondary}
              checked={prefs.read_receipts}
              onPress={setToggle("read_receipts")}
            />
          }
        />

        <Block flex={0} paddingVertical={sizes.sm}>
          <Text p semibold>Profile photo</Text>
          <Text size={12} color={colors.gray} marginBottom={sizes.xs}>
            Choose who can view your photo
          </Text>
          <SelectInput
            label=""
            placeholder="Select photo visibility"
            value={
              prefs.photo_visibility === 'everyone'
                ? 'Everyone'
                : prefs.photo_visibility === 'hidden'
                  ? 'Hidden'
                  : 'Approved only'
            }
            options={['Approved only', 'Everyone', 'Hidden']}
            onChange={(value) => {
              if (value === 'Everyone') {
                setPhotoVisibility('everyone');
                return;
              }
              if (value === 'Hidden') {
                setPhotoVisibility('hidden');
                return;
              }
              setPhotoVisibility('approved_only');
            }}
          />
        </Block>

        {prefs.photo_visibility === 'approved_only' ? (
          <Row
            label="Photo requests"
            help="Approve who can see your photo"
            right={(
              <Button onPress={() => router.push(ROUTES.SETTINGS_PHOTO_REQUESTS)}>
                <Text p semibold color={colors.primary}>Manage</Text>
              </Button>
            )}
          />
        ) : null}

        {/* Save hint */}
        <Block marginTop={sizes.sm}>
          <Text size={12} color={colors.gray}>
            Changes are saved automatically{saving ? "…" : "."}
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
