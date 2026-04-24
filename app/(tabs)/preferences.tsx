import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { Block, Text, Input, Button, SelectInput } from "@/components";
import { useData, useToast } from "@/hooks";
import SettingsService, { type MatchPreferences } from "@/services/settings";

const PRAYER_OPTIONS = ['5x daily', 'Regularly', 'Sometimes', 'Rarely', 'Never'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];

const EMPTY_PREFERENCES: MatchPreferences = {
  min_age: null,
  max_age: null,
  country: null,
  state: null,
  city: null,
  education: null,
  prayer_regularity: null,
  quran_level: null,
  marital_status: null,
};

const Preferences = () => {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, gradients } = theme;

  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [education, setEducation] = useState("");
  const [prayerRegularity, setPrayerRegularity] = useState("");
  const [quranLevel, setQuranLevel] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sanitizeAgeInput = (value: string) => value.replace(/\D/g, "");

  const Section = ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <Block
      color={colors.card}
      radius={sizes.cardRadius || 16}
      padding={sizes.m}
      marginBottom={sizes.m}
      shadow
    >
      <Text h5 semibold marginBottom={sizes.xs}>
        {title}
      </Text>
      {description ? (
        <Text size={12} color={colors.gray} marginBottom={sizes.m}>
          {description}
        </Text>
      ) : null}
      {children}
    </Block>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Text
      size={12}
      semibold
      color={colors.input}
      marginBottom={sizes.xs}
    >
      {children}
    </Text>
  );

  useEffect(() => {
    (async () => {
      try {
        const prefs = await SettingsService.getMatchPreferences();
        setMinAge(prefs.min_age ? String(prefs.min_age) : "");
        setMaxAge(prefs.max_age ? String(prefs.max_age) : "");
        setCountry(prefs.country?.trim() ?? "");
        setState(prefs.state?.trim() ?? "");
        setCity(prefs.city?.trim() ?? "");
        setEducation(prefs.education?.trim() ?? "");
        setPrayerRegularity(prefs.prayer_regularity?.trim() ?? "");
        setQuranLevel(prefs.quran_level?.trim() ?? "");
        setMaritalStatus(prefs.marital_status?.trim() ?? "");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load preferences";
        show("error", message);
      } finally {
        setLoading(false);
      }
    })();
  }, [show]);

  const buildPayload = (): MatchPreferences => ({
    min_age: minAge ? Number(minAge) : null,
    max_age: maxAge ? Number(maxAge) : null,
    country: country.trim() || null,
    state: state.trim() || null,
    city: city.trim() || null,
    education: education.trim() || null,
    prayer_regularity: prayerRegularity.trim() || null,
    quran_level: quranLevel.trim() || null,
    marital_status: maritalStatus.trim() || null,
  });

  const clearPreferences = async () => {
    setSaving(true);
    try {
      await SettingsService.updateMatchPreferences(EMPTY_PREFERENCES);
      setMinAge("");
      setMaxAge("");
      setCountry("");
      setState("");
      setCity("");
      setEducation("");
      setPrayerRegularity("");
      setQuranLevel("");
      setMaritalStatus("");
      show("success", "Preferences cleared");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to clear preferences";
      show("error", message);
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = async () => {
    if (minAge && maxAge && Number(minAge) > Number(maxAge)) {
      Alert.alert(
        "Invalid age range",
        "Minimum age cannot be greater than maximum age."
      );
      return;
    }

    setSaving(true);
    try {
      await SettingsService.updateMatchPreferences(buildPayload());
      show("success", "Preferences saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save preferences";
      show("error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Block safe flex={1} color={colors.background}>
      <ScrollView
        contentContainerStyle={{
          padding: sizes.m,
          paddingBottom: sizes.l,
        }}
      >
        <Text h5 semibold>
          Preferences & Filters
        </Text>
        <Text gray size={sizes.s} marginTop={sizes.xs} marginBottom={sizes.m}>
          Saved preferences are automatically applied to your profile list.
        </Text>

        <Section
          title="Age Range"
          description="Choose the age range you want to see first in your feed."
        >
          <Block row justify="space-between">
            <Block flex={1} marginRight={sizes.s}>
              <FieldLabel>Min Age</FieldLabel>
              <Input
                keyboardType="numeric"
                value={minAge}
                onChangeText={(value) => setMinAge(sanitizeAgeInput(value))}
                placeholder="e.g. 20"
                noMarginBottom
              />
            </Block>
            <Block flex={1} marginLeft={sizes.s}>
              <FieldLabel>Max Age</FieldLabel>
              <Input
                keyboardType="numeric"
                value={maxAge}
                onChangeText={(value) => setMaxAge(sanitizeAgeInput(value))}
                placeholder="e.g. 35"
                noMarginBottom
              />
            </Block>
          </Block>
        </Section>

        <Section
          title="Location"
          description="Use location filters to prioritize nearby or preferred regions."
        >
          <FieldLabel>Country</FieldLabel>
          <Input
            placeholder="e.g. India"
            value={country}
            onChangeText={setCountry}
            noMarginBottom
          />

          <Block marginTop={sizes.m}>
            <FieldLabel>State</FieldLabel>
            <Input
              placeholder="e.g. Telangana"
              value={state}
              onChangeText={setState}
              noMarginBottom
            />
          </Block>

          <Block marginTop={sizes.m}>
            <FieldLabel>City</FieldLabel>
            <Input
              placeholder="e.g. Hyderabad"
              value={city}
              onChangeText={setCity}
              noMarginBottom
            />
          </Block>
        </Section>

        <Section
          title="Lifestyle & Background"
          description="Set the profile qualities that matter most to you."
        >
          <FieldLabel>Education</FieldLabel>
          <Input
            placeholder="e.g. MSc, B.Tech, MBA"
            value={education}
            onChangeText={setEducation}
            noMarginBottom
          />

          <Block marginTop={sizes.m}>
            <FieldLabel>Marital Status</FieldLabel>
            <SelectInput
              label=""
              options={MARITAL_OPTIONS}
              value={maritalStatus}
              onChange={setMaritalStatus}
              noMarginBottom
            />
          </Block>

          <Block marginTop={sizes.m}>
            <FieldLabel>Prayer Regularity</FieldLabel>
            <SelectInput
              label=""
              options={PRAYER_OPTIONS}
              value={prayerRegularity}
              onChange={setPrayerRegularity}
              noMarginBottom
            />
          </Block>

          <Block marginTop={sizes.m}>
            <FieldLabel>Qur'an Level</FieldLabel>
            <Input
              placeholder="e.g. Intermediate"
              value={quranLevel}
              onChangeText={setQuranLevel}
              noMarginBottom
            />
          </Block>
        </Section>

        <Button gradient={gradients.secondary} onPress={applyFilters} disabled={loading || saving}>
          <Text white bold>{saving ? "Saving…" : "Apply Filters"}</Text>
        </Button>
        <Button marginTop={sizes.s} onPress={clearPreferences} disabled={loading || saving}>
          <Text p semibold color={colors.link}>Clear Preferences</Text>
        </Button>
      </ScrollView>
    </Block >
  );
};

export default Preferences;
