// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

import { Block, Image } from '@/components';
import { useData, useRealtime } from '@/hooks';

export default function TabsLayout() {
  const { theme } = useData();
  const { summary } = useRealtime();
  const { colors, assets } = theme;
  const hasUnreadChats = summary.unread_chat_count > 0;

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
          tabBarIcon: ({ color }) => (
            <Image
              source={assets.profile}
              color={color}
              width={22}
              height={22}
              radius={0}
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
