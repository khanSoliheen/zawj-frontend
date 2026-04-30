import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';

import type { ChatListItem } from '@/chat/chat-utils';
import { Block, Image, Text } from '@/components';
import { buildChatRoute } from '@/constants/routes';
import { useAuth, useData, useRealtime, useToast } from '@/hooks';
import ChatService from '@/services/chat';
import SettingsService from '@/services/settings';
import { getUserAvatarSource } from '@/utils/avatar';
import { toUserMessage } from '@/utils/errors';

type ChatRow = ChatListItem & {
  peerGender?: string;
  isOnline?: boolean;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
};

type ChatFilter = 'all' | 'unread' | 'requests' | 'declined' | 'blocked';

const ChatList = () => {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { lastEvent, eventTick } = useRealtime();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [chats, setChats] = useState<ChatRow[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');
  const [busyPeerId, setBusyPeerId] = useState<string | null>(null);

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
        status: row.blocked ? 'blocked' : row.status,
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

  const handleConnectionAction = useCallback(async (peerId: string, action: 'accept' | 'decline') => {
    if (busyPeerId) {
      return;
    }

    setBusyPeerId(peerId);
    try {
      const connection = await ChatService.getConnection(peerId);
      if (!connection) {
        show('error', 'Connection not found');
        return;
      }

      if (action === 'accept') {
        await ChatService.acceptConnection(connection.id);
      } else {
        await ChatService.declineConnection(connection.id);
      }

      await loadChats({ silent: true });
    } catch (error) {
      show('error', toUserMessage(error, `Failed to ${action} request`));
    } finally {
      setBusyPeerId(null);
    }
  }, [busyPeerId, loadChats, show]);

  const handleBlockAction = useCallback(async (peerId: string, action: 'block' | 'unblock') => {
    if (busyPeerId) {
      return;
    }

    setBusyPeerId(peerId);
    try {
      if (action === 'block') {
        await SettingsService.blockUser(peerId);
      } else {
        await SettingsService.unblockUser(peerId);
      }

      await loadChats({ silent: true });
    } catch (error) {
      show('error', toUserMessage(error, `Failed to ${action} user`));
    } finally {
      setBusyPeerId(null);
    }
  }, [busyPeerId, loadChats, show]);

  const renderItem = ({ item }: { item: ChatRow }) => (
    <Block
      padding={sizes.m}
      marginBottom={sizes.s}
      radius={sizes.cardRadius || 12}
      color={item.unread ? colors.secondary : colors.card}
      shadow
    >
      <Block row align="center">
        <TouchableOpacity
          onPress={() => router.push({
            pathname: buildChatRoute(item.id), params: {
              name: item.name,
              peerId: item.peerId,
              peerAvatarUrl: typeof item.avatar === 'object' && item.avatar !== null && 'uri' in item.avatar
                ? item.avatar.uri
                : '',
            }
          })}
          activeOpacity={0.8}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
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
            style={{ position: 'absolute', left: 40, bottom: 0, borderWidth: 2, borderColor: String(colors.background) }}
          />

          <Block flex={1}>
            <Block row align="center">
              <Text semibold color={colors.text} numberOfLines={1} style={{ flexShrink: 1 }}>
                {item.name}
              </Text>
            </Block>
            <Text
              gray={!item.unread}
              semibold={item.unread}
              color={item.unread ? colors.text : undefined}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.status === 'declined' ? (
              <Text size={11} color={colors.gray} marginTop={2}>
                Declined request
              </Text>
            ) : null}
            {item.status === 'blocked' ? (
              <Text size={11} color={colors.gray} marginTop={2}>
                Blocked chat
              </Text>
            ) : null}
          </Block>

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
        </TouchableOpacity>
      </Block>

      {activeFilter === 'declined' && item.status === 'declined' ? (
        <Block row align="center" justify='flex-end' marginTop={sizes.s} paddingTop={sizes.s} style={{ borderTopWidth: 1, borderTopColor: String(colors.card) }}>
          {/*<Text size={10} color={colors.gray} semibold marginRight={sizes.s}>
            Request controls
          </Text>*/}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={busyPeerId === item.peerId}
            onPress={() => void handleConnectionAction(item.peerId, 'accept')}
            style={{ marginRight: sizes.xs }}
          >
            <Block
              flex={0}
              paddingHorizontal={sizes.s}
              paddingVertical={sizes.xs}
              radius={14}
              color={colors.primary}
              style={{ minWidth: 64, alignItems: 'center' }}
            >
              <Text size={11} color={colors.white} semibold>Accept</Text>
            </Block>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={busyPeerId === item.peerId}
            onPress={() => void handleConnectionAction(item.peerId, 'decline')}
            style={{ marginRight: sizes.xs }}
          >
            <Block
              flex={0}
              paddingHorizontal={sizes.s}
              paddingVertical={sizes.xs}
              radius={14}
              color={colors.background}
              style={{
                minWidth: 64,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: String(colors.card),
              }}
            >
              <Text size={11} color={colors.text} semibold>Decline</Text>
            </Block>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={busyPeerId === item.peerId}
            onPress={() => void handleBlockAction(item.peerId, 'block')}
          >
            <Block
              flex={0}
              paddingHorizontal={sizes.s}
              paddingVertical={sizes.xs}
              radius={14}
              color={colors.background}
              style={{
                minWidth: 54,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: String(colors.card),
              }}
            >
              <Text size={11} color={colors.gray} semibold>Block</Text>
            </Block>
          </TouchableOpacity>
        </Block>
      ) : null}

      {activeFilter === 'blocked' && item.status === 'blocked' ? (
        <Block row align="center" justify='flex-end' marginTop={sizes.s} paddingTop={sizes.s} style={{ borderTopWidth: 1, borderTopColor: String(colors.card) }}>
          {/*<Text size={10} color={colors.gray} semibold marginRight={sizes.s}>
            Block controls
          </Text>*/}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={busyPeerId === item.peerId}
            onPress={() => void handleBlockAction(item.peerId, 'unblock')}
          >
            <Block
              flex={0}
              paddingHorizontal={sizes.m}
              paddingVertical={sizes.xs}
              radius={14}
              color={colors.background}
              style={{
                alignItems: 'center',
                borderWidth: 1,
                borderColor: String(colors.card),
              }}
            >
              <Text size={11} color={colors.text} semibold>Unblock</Text>
            </Block>
          </TouchableOpacity>
        </Block>
      ) : null}
    </Block>
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

    if (activeFilter === 'blocked') {
      return chat.status === 'blocked';
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sizes.m,
          paddingTop: sizes.s,
          paddingBottom: sizes.xs,
        }}
        style={{ flexGrow: 0 }}
      >
        {([
          ['all', 'All'],
          ['unread', 'Unread'],
          ['requests', 'Requests'],
          ['declined', 'Declined'],
          ['blocked', 'Blocked'],
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
      </ScrollView>
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={{
          marginTop: sizes.m,
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
