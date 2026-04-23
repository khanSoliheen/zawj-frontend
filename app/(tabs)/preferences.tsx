import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { Block, Text, Input, Button, SelectInput } from "@/components";
import { useData, useToast } from "@/hooks";
import SettingsService, { type MatchPreferences } from "@/services/settings";

const PRAYER_OPTIONS = ['5x daily', 'Regularly', 'Sometimes', 'Rarely', 'Never'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];

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
        <Text h5 semibold marginBottom={sizes.m}>
          Preferences & Filters
        </Text>
        <Text gray size={sizes.s} marginBottom={sizes.m}>
          Saved preferences are automatically applied to your profile list.
        </Text>

        <Block row justify="space-between" marginBottom={sizes.m}>
          <Block flex={1} marginRight={sizes.s}>
            <Text gray size={sizes.s}>Min Age</Text>
            <Input
              keyboardType="numeric"
              value={minAge}
              onChangeText={(value) => setMinAge(sanitizeAgeInput(value))}
              placeholder="e.g. 20"
            />
          </Block>
          <Block flex={1} marginLeft={sizes.s}>
            <Text gray size={sizes.s}>Max Age</Text>
            <Input
              keyboardType="numeric"
              value={maxAge}
              onChangeText={(value) => setMaxAge(sanitizeAgeInput(value))}
              placeholder="e.g. 35"
            />
          </Block>
        </Block>

        <Text gray size={sizes.s}>Country</Text>
        <Input
          placeholder="e.g. India"
          value={country}
          onChangeText={setCountry}
          marginBottom={sizes.m}
        />

        <Text gray size={sizes.s}>State</Text>
        <Input
          placeholder="e.g. Telangana"
          value={state}
          onChangeText={setState}
          marginBottom={sizes.m}
        />

        <Text gray size={sizes.s}>City</Text>
        <Input
          placeholder="e.g. Hyderabad"
          value={city}
          onChangeText={setCity}
          marginBottom={sizes.m}
        />

        <Text gray size={sizes.s}>Education</Text>
        <Input
          placeholder="e.g. MSc, B.Tech, MBA"
          value={education}
          onChangeText={setEducation}
          marginBottom={sizes.m}
        />

        <SelectInput
          label="Marital Status"
          options={MARITAL_OPTIONS}
          value={maritalStatus}
          onChange={setMaritalStatus}
        />

        <SelectInput
          label="Prayer Regularity"
          options={PRAYER_OPTIONS}
          value={prayerRegularity}
          onChange={setPrayerRegularity}
        />

        <Text gray size={sizes.s}>Qur'an Level</Text>
        <Input
          placeholder="e.g. Intermediate"
          value={quranLevel}
          onChangeText={setQuranLevel}
          marginBottom={sizes.m}
        />

        <Button gradient={gradients.secondary} onPress={applyFilters} disabled={loading || saving}>
          <Text white bold>{saving ? "Saving…" : "Apply Filters"}</Text>
        </Button>
      </ScrollView>
    </Block >
  );
};

export default Preferences;
