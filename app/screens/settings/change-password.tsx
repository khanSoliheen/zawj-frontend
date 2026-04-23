import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Block, Button, Text, Input, Image } from "@/components";
import { useData, useToast } from "@/hooks";
import AuthService from "@/services/auth";

// Zod schema (min 8 chars + confirm match)
const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((vals) => vals.password === vals.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePassword() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async ({ password }: FormValues) => {
    try {
      await AuthService.changePassword(password);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update password";
      show("error", message);
      return;
    }
    show("success", "Password updated");
    router.back();
  };

  return (
    <Block safe flex={1} color={colors.background}>
      {/* Header */}
      <Block row flex={0} align="center" justify="flex-start" paddingVertical={sizes.s} marginBottom={sizes.sm}>
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
        <Text h5 semibold>Change Password</Text>
        <Block width={40} />
      </Block>

      {/* Form */}
      <Block paddingHorizontal={sizes.padding}>
        <Text p marginBottom={sizes.s}>
          Set a new password for your account.
        </Text>
        {/* New Password */}
        <Block flex={0} style={{ zIndex: 0 }} >
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                placeholder="New password"
                secureTextEntry
                marginBottom={sizes.md}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                autoCapitalize="none"
                error={errors.password?.message}
                success={dirtyFields.password && !errors.password}
              />
            )}
          />
        </Block>
        {/* Confirm Password */}
        <Block flex={0} style={{ zIndex: 0 }}>
          <Controller
            control={control}
            name="confirm"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                placeholder="Confirm new password"
                secureTextEntry
                marginBottom={sizes.m}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                autoCapitalize="none"
                error={errors.confirm?.message}
                success={dirtyFields.confirm && !errors.confirm}
              />
            )}
          />
        </Block>
        <Button
          color={colors.primary}
          marginTop={sizes.s}
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          <Text white semibold>
            {isSubmitting ? "Saving..." : "Change Password"}
          </Text>
        </Button>
      </Block>
    </Block>
  );
}
