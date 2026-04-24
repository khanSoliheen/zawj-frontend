import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import { Block, Button, Image, Text } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useAuth, useData, useToast } from '@/hooks';
import UserService, { type ProfileResponse } from '@/services/users';

function getAge(dob?: string) {
  if (!dob) return '—';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}

const joinValues = (...values: Array<string | null | undefined>) =>
  values.map((value) => value?.trim()).filter(Boolean).join(', ');

const valueOrFallback = (value?: string | null, fallback = '—') => {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
};

const childrenText = (count?: string | null, details?: string | null) => {
  const normalizedCount = count?.trim();
  const normalizedDetails = details?.trim();

  if (!normalizedCount) {
    return '—';
  }

  if (normalizedCount === '0') {
    return 'No children';
  }

  const label = `${normalizedCount} ${Number(normalizedCount) === 1 ? 'child' : 'children'}`;
  return normalizedDetails ? `${label} • ${normalizedDetails}` : label;
};

const Profile = () => {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { show } = useToast();
  const { assets, colors, sizes } = theme;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const data = await UserService.getMyProfile();
      setProfile(data);
      setAvatarUrl(data?.avatar_url ?? null);
      setAvatarLoadFailed(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load profile';
      show('error', message);
    }
  }, [currentUser?.id, show]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      show('error', 'Permission to access photos is required.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
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
      const contentType = asset.mimeType || 'image/jpeg';
      const fileName =
        asset.fileName || `avatar.${asset.mimeType?.split('/').pop() || 'jpg'}`;
      const response = await UserService.uploadMyAvatar({
        file_name: fileName,
        content_type: contentType,
        base64_data: base64,
      });
      setAvatarUrl(response.avatar_url);
      setAvatarLoadFailed(false);
      setProfile((prev) => (prev ? { ...prev, avatar_url: response.avatar_url } : prev));
      show('success', 'Photo updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload';
      show('error', message);
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
      setProfile((prev) => (prev ? { ...prev, avatar_url: '' } : prev));
      show('success', 'Photo removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove photo';
      show('error', message);
    } finally {
      setUploading(false);
    }
  };

  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  const resolvedAvatarUrl = avatarUrl?.trim() ? avatarUrl.trim() : null;
  const age = profile?.dob ? String(getAge(profile.dob)) : '—';
  const location = joinValues(profile?.city, profile?.state, profile?.country) || '—';
  const profession = profile?.designation || profile?.department || profile?.employment_type || '—';
  const subtitle = [profile?.gender, age !== '—' ? `${age} years` : null].filter(Boolean).join(', ');
  const waliDetails = [profile?.wali_name, profile?.wali_relation].filter(Boolean).join(' • ') || '—';

  return (
    <Block color={colors.background} safe marginTop={sizes.md}>
      <Block
        scroll
        paddingHorizontal={sizes.s}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.padding }}
      >
        <Block flex={0}>
          {/* Header with Back + Settings */}
          <Image
            background
            resizeMode="cover"
            padding={sizes.sm}
            paddingBottom={sizes.l}
            radius={sizes.cardRadius}
            source={assets.background}
          >
            <Block row justify="space-between" align="center">
              <Button row flex={0} justify="flex-start" onPress={() => router.back()}>
                <Image
                  radius={0}
                  width={10}
                  height={18}
                  color={colors.white}
                  source={assets.arrow}
                  transform={[{ rotate: '180deg' }]}
                />
                <Text p white marginLeft={sizes.s}>
                  Profile
                </Text>
              </Button>

              {/* Settings */}
              <Button onPress={() => router.push(ROUTES.SETTINGS)}>
                <Image
                  source={assets.settings}
                  width={20}
                  height={20}
                  color={colors.white}
                />
              </Button>
            </Block>

            {/* Avatar + Name */}
            <Block flex={0} align="center" marginTop={sizes.sm}>
              <Button accessibilityLabel="Edit avatar" onPress={pickAvatar} disabled={uploading}>
                <Image
                  width={100}
                  height={100}
                  radius={50}
                  marginBottom={sizes.sm}
                  source={
                    resolvedAvatarUrl && !avatarLoadFailed
                      ? { uri: resolvedAvatarUrl }
                      : assets.avatar1
                  }
                  onError={() => setAvatarLoadFailed(true)}
                />
              </Button>
              {uploading ? (
                <Text p center color={colors.white} marginBottom={sizes.sm}>
                  Uploading…
                </Text>
              ) : null}
              {resolvedAvatarUrl ? (
                <Button
                  accessibilityLabel="Remove avatar"
                  onPress={removeAvatar}
                  disabled={uploading}
                >
                  <Text p semibold color={colors.white} marginBottom={sizes.sm}>
                    Remove photo
                  </Text>
                </Button>
              ) : null}
              <Text h5 center white>
                {fullName || 'Anonymous'}
              </Text>
              <Text p center white>
                {profile?.designation || profile?.department || 'Profile'}
              </Text>
              <Text p center white>
                {subtitle || '—'}
              </Text>
            </Block>
          </Image>

          {/* About */}
          <Block paddingHorizontal={sizes.sm}>
            <Block row align="center" justify="space-between" marginBottom={sizes.s} marginTop={sizes.sm}>
              <Text h5 semibold>
                About me
              </Text>
              <Button
                accessibilityLabel="Edit about me"
                onPress={() => router.push(ROUTES.SETTINGS_EDIT)}
              >
                <Text p semibold color={colors.primary}>
                  Edit
                </Text>
              </Button>
            </Block>
            <Text p lineHeight={26}>{profile?.bio || 'No bio added yet.'}</Text>
          </Block>

          {/* Profile Details */}
          <Block paddingHorizontal={sizes.sm} marginTop={sizes.m}>
            <Text h5 semibold marginBottom={sizes.s}>
              Profile Details
            </Text>

            <Text p><Text semibold>Age:</Text> {age}</Text>
            <Text p><Text semibold>Location:</Text> {location}</Text>
            <Text p><Text semibold>Marital status:</Text> {valueOrFallback(profile?.marital_status)}</Text>
            <Text p><Text semibold>Education:</Text> {valueOrFallback(profile?.education)}</Text>
            <Text p><Text semibold>Employment:</Text> {valueOrFallback(profile?.employment_type)}</Text>
            <Text p><Text semibold>Profession:</Text> {profession}</Text>
            <Text p><Text semibold>Department:</Text> {valueOrFallback(profile?.department)}</Text>
            <Text p><Text semibold>Children:</Text> {childrenText(profile?.children_count, profile?.children_details)}</Text>

            <Text p semibold marginTop={sizes.s}>Deen Practices:</Text>
            <Text p><Text semibold>Religion:</Text> {valueOrFallback(profile?.religion)}</Text>
            <Text p><Text semibold>Prayer:</Text> {valueOrFallback(profile?.prayer_regularity)}</Text>
            <Text p><Text semibold>Qur’an:</Text> {valueOrFallback(profile?.quran_level)}</Text>
            <Text p>
              <Text semibold>{profile?.gender === 'Female' ? 'Hijab' : 'Beard'}:</Text> {valueOrFallback(profile?.hijab_or_beard)}
            </Text>

            <Text p marginTop={sizes.s}>
              <Text semibold>Wali:</Text> {waliDetails}
            </Text>
            <Text p>
              <Text semibold>Visibility:</Text> {valueOrFallback(profile?.visibility)}
            </Text>
            <Text p>
              <Text semibold>Email status:</Text> {profile?.email_verified ? 'Verified' : 'Unverified'}
            </Text>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};

export default Profile;
