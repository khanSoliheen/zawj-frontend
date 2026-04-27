import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';

import { Block, Image, MoreMenu, Text } from '@/components';
import { ROUTES, buildChatRoute } from '@/constants/routes';
import { useAuth, useData, useRealtime, useToast } from '@/hooks';
import SettingsService from '@/services/settings';
import UserService, { type ProfileResponse } from '@/services/users';
import { getUserAvatarSource } from '@/utils/avatar';
import { toUserMessage } from '@/utils/errors';
import { Utils } from '@/utils/utils';

const joinValues = (...values: Array<string | null | undefined>) =>
  values.map((value) => value?.trim()).filter(Boolean).join(', ');

const Profile = () => {
  const { theme } = useData();
  const { id } = useLocalSearchParams();
  const { billingStatus, currentUser } = useAuth();
  const { lastEvent } = useRealtime();
  const { show } = useToast();
  const { assets, colors, sizes } = theme;

  const [userDetails, setUserDetails] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingPhoto, setRequestingPhoto] = useState(false);
  const [busyInterest, setBusyInterest] = useState(false);
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
        console.log(data);
      } catch (error) {
        if (isMounted) {
          show('error', toUserMessage(error, 'Failed to load profile'));
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
  }, [id, show]);

  useEffect(() => {
    if (!userDetails?.photo_access_notice) {
      return;
    }

    Alert.alert('Photo Access', userDetails.photo_access_notice);
  }, [userDetails?.photo_access_notice]);

  useEffect(() => {
    if (!lastEvent || !id) {
      return;
    }

    if (lastEvent.type === 'presence_updated' && lastEvent.user_id === String(id)) {
      setUserDetails((current) => current ? { ...current, is_online: lastEvent.is_online } : current);
    }
  }, [id, lastEvent]);

  const handleSendMessage = () => {
    if (!currentUser) return;

    if (!billingStatus || !['active', 'grace'].includes(billingStatus.access_state)) {
      show('info', 'Premium is required to send a new message request.');
      router.push(ROUTES.SETTINGS_BILLING);
      return;
    }

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
      show('error', toUserMessage(error, 'Failed to request photo access'));
    } finally {
      setRequestingPhoto(false);
    }
  };

  const toggleInterest = async () => {
    if (!id || busyInterest || !userDetails) return;

    setBusyInterest(true);
    try {
      const response = userDetails.interested
        ? await UserService.removeInterest(String(id))
        : await UserService.expressInterest(String(id));
      setUserDetails((current) => current ? { ...current, interested: response.interested } : current);
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to update interest'));
    } finally {
      setBusyInterest(false);
    }
  };

  const fullName = `${userDetails?.first_name || ''} ${userDetails?.last_name || ''}`.trim();
  const location = joinValues(userDetails?.city, userDetails?.state, userDetails?.country) || 'Location not shared';
  const profession = userDetails?.designation || userDetails?.employment_type || userDetails?.department || 'Not provided';
  const education = userDetails?.education || 'Not provided';
  const bio = userDetails?.bio?.trim() || 'No bio added yet.';
  const age = userDetails?.dob ? `${Utils.getAge(userDetails.dob)} years` : null;
  const subtitle = [userDetails?.gender, age].filter(Boolean).join(', ') || 'Profile';
  const avatarSource = getUserAvatarSource({
    assets,
    avatarUrl: userDetails?.avatar_url,
    gender: userDetails?.gender,
  });
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
      <Block
        scroll
        paddingHorizontal={sizes.padding}
        contentContainerStyle={{ paddingBottom: sizes.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <Block row align="center" justify="space-between" paddingVertical={sizes.s}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
            <Block row align="center">
              <Image
                radius={0}
                width={10}
                height={18}
                color={colors.text}
                source={assets.arrow}
                transform={[{ rotate: '180deg' }]}
              />
              <Text h5 semibold marginLeft={sizes.s}>Profile</Text>
            </Block>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={() => setMenuOpen(true)}>
            <Image radius={0} width={20} height={20} source={assets.more} color={colors.text} />
          </TouchableOpacity>
        </Block>

        <Block align="center" paddingVertical={sizes.m}>
          <Block flex={0} align="center" justify="center">
            <Image width={112} height={112} radius={56} source={avatarSource} />
            <Block
              flex={0}
              width={18}
              height={18}
              radius={9}
              color={userDetails?.is_online ? colors.success : colors.gray}
              style={{
                position: 'absolute',
                right: 4,
                bottom: 4,
                borderWidth: 2,
                borderColor: String(colors.background),
              }}
            />
          </Block>

          {photoLocked ? (
            <Block align="center" marginTop={sizes.s}>
              <Text size={12} center color={colors.gray} marginBottom={sizes.xs}>
                {photoStatusText}
              </Text>
              {photoAccessStatus !== 'pending' && photoAccessStatus !== 'hidden' ? (
                <TouchableOpacity activeOpacity={0.8} onPress={() => void requestPhotoAccess()} disabled={requestingPhoto}>
                  <Block
                    flex={0}
                    color={colors.card}
                    radius={20}
                    paddingHorizontal={sizes.m}
                    paddingVertical={sizes.xs}
                  >
                    <Text p semibold color={colors.text}>
                      {requestingPhoto ? 'Requesting…' : 'Request Photo Access'}
                    </Text>
                  </Block>
                </TouchableOpacity>
              ) : null}
            </Block>
          ) : null}

          <Text h4 semibold center marginTop={sizes.m}>
            {fullName || 'Profile'}
          </Text>
          <Text p center color={colors.gray} marginTop={2}>
            {loading ? 'Loading profile…' : subtitle}
          </Text>
          {/*<Block row align="center" marginTop={sizes.xs}>
            <Block
              flex={0}
              width={8}
              height={8}
              radius={4}
              color={userDetails?.is_online ? colors.success : colors.gray}
              marginRight={sizes.xs}
            />
            <Text size={12} color={userDetails?.is_online ? colors.success : colors.gray} semibold>
              {userDetails?.is_online ? 'Online' : 'Offline'}
            </Text>
          </Block>*/}

          <Block row marginTop={sizes.m}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSendMessage} disabled={loading || !userDetails}>
              <Block
                row
                flex={0}
                color={colors.text}
                radius={24}
                paddingHorizontal={sizes.m}
                paddingVertical={sizes.s}
                align="center"
                justify="center"
                marginRight={sizes.s}
              >
                <Image source={assets.chat} width={18} height={18} color={colors.white} radius={0} />
                <Text p semibold color={colors.white} marginLeft={sizes.xs}>
                  Message
                </Text>
              </Block>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => void toggleInterest()} disabled={busyInterest || loading || !userDetails}>
              <Block
                row
                flex={0}
                color={userDetails?.interested ? colors.primary : colors.card}
                radius={24}
                paddingHorizontal={sizes.m}
                paddingVertical={sizes.s}
                align="center"
                justify="center"
              >
                <Image
                  source={assets.star}
                  width={18}
                  height={18}
                  color={userDetails?.interested ? colors.white : colors.text}
                  radius={0}
                />
                <Text
                  p
                  semibold
                  color={userDetails?.interested ? colors.white : colors.text}
                  marginLeft={sizes.xs}
                >
                  {userDetails?.interested ? 'Interested' : 'Interest'}
                </Text>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>

        <Block marginTop={sizes.m}>
          <Text h5 semibold marginBottom={sizes.s}>About Me</Text>
          <Text p lineHeight={26}>{loading ? 'Loading profile…' : bio}</Text>
        </Block>

        <Block marginTop={sizes.l}>
          <Text h5 semibold marginBottom={sizes.s}>Profile Details</Text>
          <Text p><Text semibold>Profession:</Text> {loading ? 'Loading…' : profession}</Text>
          <Text p><Text semibold>Location:</Text> {loading ? 'Loading…' : location}</Text>
          <Text p><Text semibold>Education:</Text> {loading ? 'Loading…' : education}</Text>
          <Text p><Text semibold>Marital status:</Text> {loading ? 'Loading…' : userDetails?.marital_status || 'Not provided'}</Text>
        </Block>

        <Block marginTop={sizes.l}>
          <Text h5 semibold marginBottom={sizes.s}>Deen Practices</Text>
          <Text p><Text semibold>Prayer:</Text> {loading ? 'Loading…' : userDetails?.prayer_regularity || 'Not provided'}</Text>
          <Text p><Text semibold>Qur’an Level:</Text> {loading ? 'Loading…' : userDetails?.quran_level || 'Not provided'}</Text>
          <Text p>
            <Text semibold>{userDetails?.gender === 'Female' ? 'Hijab' : 'Beard'}:</Text>{' '}
            {loading ? 'Loading…' : userDetails?.hijab_or_beard || 'Not provided'}
          </Text>
        </Block>
      </Block>

      <MoreMenu targetUserId={String(id)} visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </Block>
  );
};

export default Profile;
