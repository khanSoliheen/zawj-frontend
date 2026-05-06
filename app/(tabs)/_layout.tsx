// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { Block, Image } from '@/components';
import { useAuth, useData, useRealtime } from '@/hooks';
import UserService from '@/services/users';
import { getUserAvatarSource } from '@/utils/avatar';

const ProfileTabIcon = ({ focused }: { focused: boolean }) => {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { colors, assets } = theme;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!currentUser?.id) {
      setAvatarUrl(null);
      return undefined;
    }

    void (async () => {
      try {
        const profile = await UserService.getMyProfile();
        if (!isMounted) {
          return;
        }

        setAvatarUrl(profile.avatar_url ?? null);
      } catch {
        if (isMounted) {
          setAvatarUrl(null);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const avatar = getUserAvatarSource({
    assets,
    avatarUrl,
    gender: typeof currentUser?.userMetadata?.gender === 'string' ? currentUser.userMetadata.gender : null,
  });

  return (
    <Image
      key={avatarUrl ?? 'profile-avatar-fallback'}
      source={avatar}
      width={25}
      height={25}
      radius={12}
      style={{
        borderWidth: focused ? 2 : 1,
        borderColor: String(focused ? colors.primary : colors.gray),
      }}
    />
  );
};

export default function TabsLayout() {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { summary } = useRealtime();
  const { colors, assets } = theme;

  const hasUnreadChats = summary.unread_chat_count > 0 || summary.pending_message_request_count > 0;
  const showTabs = !!currentUser?.id;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary as string,
        tabBarInactiveTintColor: colors.gray as string,
        tabBarStyle: showTabs
          ? { backgroundColor: colors.card as string }
          : { display: 'none' },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="users/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Image
              source={assets.home}
              color={color}
              width={22}
              height={22}
              radius={0}
            />
          ),
        }}
      />

      {/* Chat */}
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <Block flex={0}>
              <Image
                source={assets.chat}
                color={color}
                width={22}
                height={22}
                radius={0}
              />
              {hasUnreadChats ? (
                <Block
                  flex={0}
                  color={colors.primary}
                  radius={4}
                  width={8}
                  height={8}
                  style={{ position: 'absolute', right: -3, top: -1 }}
                />
              ) : null}
            </Block>
          ),
        }}
      />

      {/* Preferences */}
      <Tabs.Screen
        name="preferences"
        options={{
          title: 'Preferences',
          tabBarIcon: ({ color }) => (
            <Image
              source={assets.extras}
              color={color}
              width={22}
              height={22}
              radius={0}
            />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="users/[id]"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{ href: null, headerShown: false }}
      />
      {/*<Tabs.Screen
        name="profile/['*']"
        options={{ href: null }}   // ❌ removes from tab bar
      />*/}
    </Tabs>
  );
}
