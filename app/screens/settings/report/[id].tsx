import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Block, Button, Text, Image, Input } from "@/components";
import { useData, useToast } from "@/hooks";
import SettingsService from "@/services/settings";

// Categories you want to support
const CATEGORIES = [
  "Harassment",
  "Inappropriate Content",
  "Scam / Fraud",
  "Impersonation",
  "Hate Speech",
  "Other",
] as const;

const schema = z.object({
  category: z.enum(CATEGORIES, { error: "Please pick a category" }),
  reported_user_id: z.string().trim().optional(), // if the report is about a specific user
  details: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters"),
  contact_ok: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ReportMisconduct() {
  const { id, reported_user_id } = useLocalSearchParams<{ id?: string; reported_user_id?: string }>();
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;
  const [submitting, setSubmitting] = useState(false);
  const targetUserId = reported_user_id ?? id ?? "";
  const hasTargetUser = targetUserId.trim().length > 0;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      reported_user_id: targetUserId,
      details: "",
      contact_ok: true,
    },
  });

  const category = watch("category");

  const onPick = (c: FormValues["category"]) => () => setValue("category", c, { shouldDirty: true, shouldValidate: true });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await SettingsService.createReport({
        category: values.category,
        details: values.details,
        reported_user_id: values.reported_user_id || null,
        contact_ok: !!values.contact_ok,
      });

      show("success", "Report submitted. Our team will review it.");
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to submit report';
      show("error", message);
      setSubmitting(false);
    }
  };

  const CategoryPill = ({ label }: { label: FormValues["category"] }) => {
    const active = category === label;
    return (
      <Button onPress={onPick(label)}>
        <Block
          paddingHorizontal={sizes.s}
          paddingVertical={6}
          radius={12}
          color={active ? colors.primary : "rgba(127,127,127,0.12)"}
          style={{ marginRight: sizes.s, marginBottom: sizes.s }}
        >
          <Text p semibold color={active ? "#fff" : colors.text}>{label}</Text>
        </Block>
      </Button>
    );
  };

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
        <Text h5 semibold>Report Misconduct</Text>
        <Block width={40} />
      </Block>

      {/* Category */}
      <Block marginBottom={sizes.s}>
        <Text p semibold marginBottom={sizes.s}>Category</Text>
        <Block row wrap="wrap">
          {CATEGORIES.map((c) => (
            <CategoryPill key={c} label={c} />
          ))}
        </Block>
        {errors.category?.message ? (
          <Text size={12} color={colors.danger} marginTop={6}>{errors.category.message}</Text>
        ) : null}
      </Block>

      {hasTargetUser ? (
        <Block marginBottom={sizes.s}>
          <Text p semibold>Reporting user</Text>
          <Text size={12} color={colors.gray} marginTop={6}>
            This report will be attached to the selected user.
          </Text>
        </Block>
      ) : (
        <Controller
          control={control}
          name="reported_user_id"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              placeholder="Reported user ID (optional)"
              autoCapitalize="none"
              autoCorrect={false}
              marginBottom={sizes.s}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              ref={ref}
            />
          )}
        />
      )}

      {/* Details */}
      <Controller
        control={control}
        name="details"
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <Input
            placeholder="Describe what happened…"
            autoCapitalize="sentences"
            autoCorrect
            marginBottom={sizes.s}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            ref={ref}
            multiline
            numberOfLines={5}
            error={errors.details?.message}
            success={dirtyFields.details && !errors.details}
          />
        )}
      />

      {/* Contact OK (optional simple toggle as a text button) */}
      <Controller
        control={control}
        name="contact_ok"
        render={({ field: { value, onChange } }) => (
          <Button onPress={() => onChange(!value)}>
            <Text p color={colors.link}>
              {value ? "✓" : "○"} Allow support to contact me about this report
            </Text>
          </Button>
        )}
      />

      {/* Submit */}
      <Button
        color={colors.primary}
        marginTop={sizes.m}
        disabled={submitting}
        onPress={handleSubmit(onSubmit)}
      >
        <Text white semibold>{submitting ? "Submitting…" : "Submit Report"}</Text>
      </Button>

      <Text size={12} color={colors.gray} marginTop={sizes.s}>
        Your report will be reviewed. For urgent safety concerns, contact local authorities.
      </Text>
    </Block>
  );
}
