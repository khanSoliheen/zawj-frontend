// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

import { Image } from '@/components';
import { useData } from '@/hooks';

export default function TabsLayout() {
  const { theme } = useData();
  const { colors, assets } = theme;

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
            <Image
              source={assets.chat}
              color={color}
              width={22}
              height={22}
              radius={0}
            />
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
        options={{ href: null }}   // ❌ removes from tab bar
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{ href: null }}   // ❌ removes from tab bar
      />
      {/*<Tabs.Screen
        name="profile/['*']"
        options={{ href: null }}   // ❌ removes from tab bar
      />*/}
    </Tabs>
  );
}
