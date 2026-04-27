import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

import type { ChatListItem } from '@/chat/chat-utils';
import { Block, Image, Text } from '@/components';
import { buildChatRoute } from '@/constants/routes';
import { useAuth, useData, useRealtime, useToast } from '@/hooks';
import ChatService from '@/services/chat';
import { getUserAvatarSource } from '@/utils/avatar';
import { toUserMessage } from '@/utils/errors';

type ChatRow = ChatListItem & {
  peerGender?: string;
  isOnline?: boolean;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
};

type ChatFilter = 'all' | 'unread' | 'requests' | 'declined';

const ChatList = () => {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { lastEvent, eventTick } = useRealtime();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [chats, setChats] = useState<ChatRow[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');

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
        avatar: getUserAvatarSource({
          assets,
          avatarUrl: row.peer_avatar_url,
          gender: row.peer_gender,
        }),
        peerGender: row.peer_gender,
        isOnline: row.peer_is_online,
        unread: row.unread,
        status: row.status,
      })));
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to load conversations'));
      setChats([]);
    } finally {
      if (!isSilent) {
        setLoadingInitial(false);
      }
    }
  }, [assets, show]);

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
      return undefined;
    }, [chats.length, loadChats, userId]),
  );

  useEffect(() => {
    if (!lastEvent || !userId) {
      return;
    }

    if (
      lastEvent.type === 'message_created'
      || lastEvent.type === 'messages_read'
      || lastEvent.type === 'connection_updated'
      || lastEvent.type === 'notification_updated'
    ) {
      void loadChats({ silent: true });
    }

    if (lastEvent.type === 'presence_updated') {
      setChats((current) => current.map((chat) => (
        chat.peerId === lastEvent.user_id
          ? { ...chat, isOnline: lastEvent.is_online }
          : chat
      )));
    }
  }, [eventTick, lastEvent, loadChats, userId]);

  const renderItem = ({ item }: { item: ChatRow }) => (
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
        <Block
          flex={0}
          width={12}
          height={12}
          radius={6}
          color={item.isOnline ? colors.success : colors.gray}
          style={{ position: 'absolute', left: 67, bottom: 25, borderWidth: 2, borderColor: String(colors.background) }}
        />

        {/* Name + last message */}
        <Block flex={1}>
          <Block row align="center">
            <Text semibold color={colors.text}>{item.name}</Text>
            {/*<Text size={11} color={item.isOnline ? colors.success : colors.gray} marginLeft={sizes.xs}>
              {item.isOnline ? 'Online' : 'Offline'}
            </Text>*/}
          </Block>
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
      <Block safe flex={1} color={colors.background}>
        <Block flex={1} center align="center" justify="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </Block>
      </Block>
    );
  }

  const filteredChats = chats.filter((chat) => {
    if (activeFilter === 'unread') {
      return chat.unread;
    }

    if (activeFilter === 'requests') {
      return chat.status === 'pending';
    }

    if (activeFilter === 'declined') {
      return chat.status === 'declined';
    }

    return true;
  });

  if (chats.length === 0) {
    return (
      <Block safe flex={1} color={colors.background}>
        <Block flex={1} center justify="center" align="center">
          <Image
            source={assets.avatarMale}
            style={{ width: 120, height: 120, marginBottom: sizes.m }}
          />
          <Text h6 gray>No conversations yet</Text>
          <Text p gray>Start a chat with someone new</Text>
        </Block>
      </Block>
    );
  }

  return (
    <Block safe flex={1} color={colors.background}>
      <Block row flex={0} paddingHorizontal={sizes.m} marginTop={sizes.s} marginBottom={sizes.m}>
        {([
          ['all', 'All'],
          ['unread', 'Unread'],
          ['requests', 'Requests'],
          ['declined', 'Declined'],
        ] as const).map(([key, label]) => {
          const selected = activeFilter === key;
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(key)}
              style={{ marginRight: sizes.s }}
            >
              <Block
                flex={0}
                paddingHorizontal={sizes.m}
                paddingVertical={sizes.xs}
                radius={18}
                color={selected ? colors.primary : colors.card}
              >
                <Text size={12} semibold color={selected ? colors.white : colors.text}>
                  {label}
                </Text>
              </Block>
            </TouchableOpacity>
          );
        })}
      </Block>
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: sizes.m,
          paddingTop: 0,
          paddingBottom: sizes.l
        }}
        ListEmptyComponent={(
          <Block paddingTop={sizes.l} align="center">
            <Text p color={colors.gray}>
              {activeFilter === 'all' ? 'No conversations yet.' : `No ${activeFilter} chats right now.`}
            </Text>
          </Block>
        )}
      />
    </Block>
  );
};

export default ChatList;
