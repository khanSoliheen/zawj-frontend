import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { Block, Button, Image, MoreMenu, Text } from '@/components';
import { buildChatRoute } from '@/constants/routes';
import { useAuth, useData, useToast } from '@/hooks';
import SettingsService from '@/services/settings';
import UserService, { type ProfileResponse } from '@/services/users';
import { Utils } from '@/utils/utils';

const joinValues = (...values: Array<string | null | undefined>) =>
  values.map((value) => value?.trim()).filter(Boolean).join(', ');

const Profile = () => {
  const { theme } = useData();
  const { id } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const { show } = useToast();
  const { assets, colors, sizes, gradients } = theme;

  const [userDetails, setUserDetails] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingPhoto, setRequestingPhoto] = useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    void (async () => {
      try {
        const data = await UserService.getUser(String(id));
        if (!isMounted) {
          return;
        }

        setUserDetails(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load profile';
        if (isMounted) {
          show('error', message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [show, id]);

  useEffect(() => {
    if (!userDetails?.photo_access_notice) {
      return;
    }

    Alert.alert('Photo Access', userDetails.photo_access_notice);
  }, [userDetails?.photo_access_notice]);

  const nikahRequestHandler = async () => {
    if (!currentUser) return;

    router.push({
      pathname: buildChatRoute('new'),
      params: {
        name: fullName,
        peerId: id,
        peerAvatarUrl: userDetails?.avatar_url ?? '',
      },
    });
  };

  const requestPhotoAccess = async () => {
    if (!id || requestingPhoto) return;

    setRequestingPhoto(true);
    try {
      const response = await SettingsService.requestPhotoAccess(String(id));
      setUserDetails((current) => current ? { ...current, photo_access_status: 'pending' } : current);
      show('success', response.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request photo access';
      show('error', message);
    } finally {
      setRequestingPhoto(false);
    }
  };

  const fullName = `${userDetails?.first_name || ''} ${userDetails?.last_name || ''}`.trim();
  const location = joinValues(userDetails?.city, userDetails?.state, userDetails?.country) || 'Location not shared';
  const profession = userDetails?.designation || userDetails?.department || 'Not provided';
  const education = userDetails?.education || 'Not provided';
  const bio = userDetails?.bio?.trim() || 'No bio added yet.';
  const age = userDetails?.dob ? `${Utils.getAge(userDetails.dob)} years` : null;
  const subtitle = [userDetails?.gender, age].filter(Boolean).join(', ') || 'Profile';
  const avatarSource = userDetails?.avatar_url ? { uri: userDetails.avatar_url } : assets.avatar1;
  const photoAccessStatus = userDetails?.photo_access_status ?? null;
  const photoLocked = Boolean(userDetails?.avatar_locked);
  const photoStatusText = photoAccessStatus === 'pending'
    ? 'Photo access pending approval'
    : photoAccessStatus === 'rejected'
      ? 'Photo access was declined'
      : photoAccessStatus === 'hidden'
        ? 'This user is not sharing their photo'
        : 'Request access to view this photo';

  return (
    <Block safe flex={1} color={colors.background}>
      {/* Scrollable Content */}
      <Block scroll contentContainerStyle={{ paddingBottom: sizes.xxl }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Image
          background
          resizeMode="cover"
          padding={sizes.sm}
          paddingBottom={sizes.l}
          radius={sizes.cardRadius}
          source={assets.background}
        >
          <Block row justify="space-between" align="center" marginTop={10}>
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
                Back
              </Text>
            </Button>
            <Button onPress={() => setMenuOpen(true)}>
              <Image radius={0} width={20} height={20} source={assets.more} color={colors.text} />
            </Button>
          </Block>

          {/* Avatar + Name */}
          <Block flex={0} align="center" marginTop={sizes.sm}>
            <Image
              width={100}
              height={100}
              radius={50}
              marginBottom={sizes.sm}
              source={avatarSource}
            />
            {photoLocked ? (
              <Block flex={0} align="center" marginBottom={sizes.sm}>
                <Text size={12} center color={colors.white} marginBottom={sizes.xs}>
                  {photoStatusText}
                </Text>
                {photoAccessStatus !== 'pending' && photoAccessStatus !== 'hidden' ? (
                  <Button onPress={() => void requestPhotoAccess()} disabled={requestingPhoto}>
                    <Text p semibold color={colors.white}>
                      {requestingPhoto ? 'Requesting…' : 'Request Photo Access'}
                    </Text>
                  </Button>
                ) : null}
              </Block>
            ) : null}
            <Text h5 center white>
              {fullName || 'Profile'}
            </Text>
            <Text p center white>
              {loading ? 'Loading profile…' : subtitle}
            </Text>
          </Block>
        </Image>

        {/* About */}
        <Block paddingHorizontal={sizes.sm} marginTop={sizes.l}>
          <Text h5 semibold marginBottom={sizes.s}>
            About Me
          </Text>
          <Text p lineHeight={26}>{loading ? 'Loading profile…' : bio}</Text>
        </Block>

        {/* Details */}
        <Block paddingHorizontal={sizes.sm} marginTop={sizes.l}>
          <Text h5 semibold marginBottom={sizes.s}>Profile Details</Text>
          <Text p><Text semibold>Location:</Text> {loading ? 'Loading…' : location}</Text>
          <Text p><Text semibold>Education:</Text> {loading ? 'Loading…' : education}</Text>
          <Text p><Text semibold>Profession:</Text> {loading ? 'Loading…' : profession}</Text>
        </Block>

        {/* Deen Practices */}
        <Block paddingHorizontal={sizes.sm} marginTop={sizes.l}>
          <Text h5 semibold marginBottom={sizes.s}>Deen Practices</Text>
          <Text p>Prayer: {loading ? 'Loading…' : userDetails?.prayer_regularity || 'Not provided'}</Text>
          <Text p>Qur’an Level: {loading ? 'Loading…' : userDetails?.quran_level || 'Not provided'}</Text>
          <Text p>
            {userDetails?.gender === 'Female' ? 'Hijab' : 'Beard'}: {loading ? 'Loading…' : userDetails?.hijab_or_beard || 'Not provided'}
          </Text>
        </Block>
      </Block>

      {/* Fixed message button */}
      <Block
        flex={0}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
        }}
      >
        <Button
          gradient={gradients.secondary}
          radius={30}
          paddingHorizontal={sizes.sm}
          onPress={nikahRequestHandler}
          disabled={loading || !userDetails}
        >
          <Text color={colors.text} center semibold>
            Send Message
          </Text>
        </Button>
      </Block>
      {/* ... profile content ... */}

      <MoreMenu targetUserId={String(id)} visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </Block>
  );
};

export default Profile;
