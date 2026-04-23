import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

import type { ChatListItem } from '@/chat/chat-utils';
import { Block, Image, Text } from '@/components';
import { buildChatRoute } from '@/constants/routes';
import { useAuth, useData, useToast } from '@/hooks';
import ChatService from '@/services/chat';

const ChatList = () => {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const staticAvatar = assets.avatar1;
  const userId = currentUser?.id;

  const loadChats = useCallback(async (options: { silent?: boolean } = {}) => {
    const isSilent = options.silent ?? false;

    try {
      if (!isSilent) {
        setLoadingInitial(true);
      }
      const rows = await ChatService.getConversations();
      setChats(rows.map((row) => ({
        id: row.id,
        peerId: row.peer_id,
        name: `${row.peer_first_name} ${row.peer_last_name}`.trim() || 'User',
        lastMessage: row.last_message || 'No messages yet',
        time: row.last_message_at
          ? new Date(row.last_message_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          : '',
        avatar: row.peer_avatar_url ? { uri: row.peer_avatar_url } : staticAvatar,
        unread: row.unread,
      })));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load conversations';
      show('error', message);
      setChats([]);
    } finally {
      if (!isSilent) {
        setLoadingInitial(false);
      }
    }
  }, [show, staticAvatar]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    return () => StatusBar.setBarStyle('dark-content');
  }, []);

  useEffect(() => {
    if (!userId) return;
    void loadChats();
  }, [loadChats, userId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return undefined;
      }

      void loadChats({ silent: chats.length > 0 });

      const interval = setInterval(() => {
        void loadChats({ silent: true });
      }, 5000);

      return () => clearInterval(interval);
    }, [chats.length, loadChats, userId]),
  );

  const renderItem = ({ item }: { item: ChatListItem }) => (
    <TouchableOpacity onPress={() => router.push({
      pathname: buildChatRoute(item.id), params: {
        name: item.name,
        peerId: item.peerId,
        peerAvatarUrl: typeof item.avatar === 'object' && item.avatar !== null && 'uri' in item.avatar
          ? item.avatar.uri
          : '',
      }
    })} activeOpacity={0.8}>
      <Block
        row
        align="center"
        padding={sizes.m}
        marginBottom={sizes.s}
        radius={sizes.cardRadius || 12}
        color={item.unread ? colors.secondary : colors.card}
        shadow
      >
        {/* Avatar */}
        <Image
          source={item.avatar}
          radius={30}
          style={{ width: 52, height: 52, marginRight: sizes.m }}
        />

        {/* Name + last message */}
        <Block flex={1}>
          <Text semibold color={colors.text}>{item.name}</Text>
          <Text
            gray={!item.unread}
            semibold={item.unread}
            color={item.unread ? colors.text : undefined}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </Block>

        {/* Time */}
        {item.time ? (
          <Block align="flex-end" marginLeft={sizes.sm}>
            <Text gray={!item.unread} semibold={item.unread} color={item.unread ? colors.text : undefined}>
              {item.time}
            </Text>
            {item.unread ? (
              <Block
                flex={0}
                width={36}
                height={20}
                radius={10}
                color={colors.primary}
                marginTop={sizes.s}
                align="center"
                justify="center"
                paddingHorizontal={sizes.s}
              >
                <Text size={sizes.s} color={colors.white} semibold>
                  New
                </Text>
              </Block>
            ) : null}
          </Block>
        ) : null}
      </Block>
    </TouchableOpacity>
  );

  if (loadingInitial) {
    return (
      <Block safe flex={1} color={colors.background} center align="center" justify="center">
        <ActivityIndicator size="large" color={colors.primary} />
      </Block>
    );
  }

  if (chats.length === 0) {
    return (
      <Block safe flex={1} color={colors.background} center justify="center" align="center">
        <Image
          source={assets.avatar2}
          style={{ width: 120, height: 120, marginBottom: sizes.m }}
        />
        <Text h6 gray>No conversations yet</Text>
        <Text p gray>Start a chat with someone new</Text>
      </Block>
    );
  }

  return (
    <Block safe flex={1} color={colors.background}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: sizes.m,
          paddingBottom: sizes.l,
        }}
      />
    </Block>
  );
};

export default ChatList;
