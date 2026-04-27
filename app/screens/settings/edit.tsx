import { zodResolver } from "@hookform/resolvers/zod";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Block, Button, Text, Image, Input } from "@/components";
import { useData, useToast } from "@/hooks";
import UserService from "@/services/users";
import { getUserAvatarSource } from "@/utils/avatar";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name"),
  bio: z.string().trim().max(300, "Max 300 characters").optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  profession: z.string().trim().max(120).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export default function EditProfile() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileGender, setProfileGender] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { full_name: "", bio: "", location: "", profession: "" },
  });

  // Load current profile
  useEffect(() => {
    (async () => {
      try {
        const profile = await UserService.getMyProfile();
        reset({
          full_name: `${profile.first_name} ${profile.last_name}`.trim(),
          bio: profile.bio ?? "",
          location: [profile.city, profile.state, profile.country].filter(Boolean).join(", "),
          profession: profile.designation ?? "",
        });
        setAvatarUrl(profile.avatar_url ?? null);
        setProfileGender(profile.gender ?? null);
        setAvatarLoadFailed(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load profile";
        show("error", message);
      }
    })();
  }, [reset, show]);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      show("error", "Permission to access photos is required.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (res.canceled) return;
    const file = res.assets[0];
    await uploadAvatar(file);
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const contentType = asset.mimeType || "image/jpeg";
      const fileName =
        asset.fileName || `avatar.${asset.mimeType?.split("/").pop() || "jpg"}`;
      const response = await UserService.uploadMyAvatar({
        file_name: fileName,
        content_type: contentType,
        base64_data: base64,
      });

      setAvatarUrl(response.avatar_url);
      setAvatarLoadFailed(false);
      show("success", "Photo updated");
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to upload';
      show("error", message);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      await UserService.deleteMyAvatar();
      setAvatarUrl(null);
      setAvatarLoadFailed(false);
      show("success", "Photo removed");
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to remove photo';
      show("error", message);
    } finally {
      setUploading(false);
    }
  };
  const resolvedAvatarUrl = avatarUrl?.trim() ? avatarUrl.trim() : null;

  const onSubmit = async (values: FormValues) => {
    try {
      await UserService.updateMyProfile({
        full_name: values.full_name,
        bio: values.bio,
        location: values.location,
        profession: values.profession,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile";
      show("error", message);
      return;
    }
    show("success", "Profile saved");
    router.back();
  };

  const Field = ({
    name,
    placeholder,
    multiline = false,
  }: {
    name: keyof FormValues;
    placeholder: string;
    multiline?: boolean;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref } }) => {
        const fieldError = errors[name];
        const isDirty = !!dirtyFields[name];

        return (
          <Input
            placeholder={placeholder}
            autoCapitalize={name === "full_name" ? "words" : "sentences"}
            autoCorrect
            marginBottom={sizes.s}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            ref={ref}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            error={fieldError?.message}
            success={isDirty && !fieldError}
          />
        );
      }}
    />
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
        <Text h5 semibold>Edit Profile</Text>
        <Block width={40} />
      </Block>

      {/* Avatar */}
      <Block row align="center" marginBottom={sizes.m}>
        <Button accessibilityLabel="Edit avatar" onPress={pickAvatar} disabled={uploading}>
          <Image
            radius={32}
            width={64}
            height={64}
            source={
              resolvedAvatarUrl && !avatarLoadFailed
                ? { uri: resolvedAvatarUrl }
                : getUserAvatarSource({ assets, gender: profileGender })
            }
            onError={() => setAvatarLoadFailed(true)}
          />
        </Button>
        {uploading ? (
          <Text p semibold color={colors.link} marginLeft={sizes.s}>
            Uploading…
          </Text>
        ) : null}
      </Block>
      {resolvedAvatarUrl ? (
        <Button accessibilityLabel="Remove avatar" onPress={removeAvatar} disabled={uploading}>
          <Text p semibold color={colors.link} marginBottom={sizes.m}>
            Remove photo
          </Text>
        </Button>
      ) : null}

      {/* Form */}
      <Field name="full_name" placeholder="Full name" />
      <Field name="profession" placeholder="Profession (optional)" />
      <Field name="location" placeholder="Location (optional)" />
      <Field name="bio" placeholder="Bio (max 300 chars)" multiline />

      <Button
        color={colors.primary}
        marginTop={sizes.s}
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        <Text white semibold>{isSubmitting ? "Saving…" : "Save"}</Text>
      </Button>
    </Block>
  );
}
