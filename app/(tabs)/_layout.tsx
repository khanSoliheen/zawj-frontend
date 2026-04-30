// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

import { Block, Image } from '@/components';
import { useAuth, useData, useRealtime } from '@/hooks';
import { getUserAvatarSource } from '@/utils/avatar';

export default function TabsLayout() {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { summary } = useRealtime();
  const { colors, assets } = theme;
  const hasUnreadChats = summary.unread_chat_count > 0 || summary.pending_message_request_count > 0;
  const profileAvatar = getUserAvatarSource({
    assets,
    avatarUrl: typeof currentUser?.userMetadata?.avatar_url === 'string' ? currentUser.userMetadata.avatar_url : null,
    gender: typeof currentUser?.userMetadata?.gender === 'string' ? currentUser.userMetadata.gender : null,
  });
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary as string,
        tabBarInactiveTintColor: colors.gray as string,
        tabBarStyle: { backgroundColor: colors.card as string },
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
          tabBarIcon: ({ focused }) => (
            <Image
              source={profileAvatar}
              width={25}
              height={25}
              radius={12}
              style={{
                borderWidth: focused ? 2 : 1,
                borderColor: String(focused ? colors.primary : colors.gray),
              }}
            />
          ),
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
