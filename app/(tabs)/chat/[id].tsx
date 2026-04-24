import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import {
  groupMessagesByDate,
  mapMessageRecord,
  type ChatMessage as Message,
  type MessageListItem,
} from '@/chat/chat-utils';
import { AcceptMessage, Block, Bubble, Button, DateDivider, Image, Input, MoreMenu, Text, TimeStamp } from '@/components';
import { useAuth, useData, useRealtime, useToast } from '@/hooks';
import ChatService, { type Connection } from '@/services/chat';
import SettingsService from '@/services/settings';
import UserService from '@/services/users';
import { toUserMessage } from '@/utils/errors';

const mergeMessages = (current: Message[], incoming: Message[]) => {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => {
    byId.set(message.id, message);
  });

  return Array.from(byId.values()).sort(
    (left, right) => new Date(left.at).getTime() - new Date(right.at).getTime(),
  );
};

const getRouteParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getConnectionErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Failed to create request';

  if (message.includes('only accepts messages from matches')) {
    return 'This user only accepts new messages from matches right now.';
  }

  if (message.includes('cannot message this user')) {
    return 'You cannot message this user.';
  }

  if (message.includes('not available for new requests')) {
    return 'This profile is not accepting new message requests right now.';
  }

  return message;
};

export default function Chat() {
  const { theme } = useData();
  const { currentUser } = useAuth();
  const { lastEvent, eventTick } = useRealtime();
  const { show } = useToast();
  const { colors, sizes, assets, gradients } = theme;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<MessageListItem>>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // NEW: connection object
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [peerAvatarLoadFailed, setPeerAvatarLoadFailed] = useState(false);
  const [peerAvatarUrl, setPeerAvatarUrl] = useState('');

  // ✅ safer param hook
  const {
    id: conversationId,
    name,
    peerId: rawPeerId,
    peerAvatarUrl: rawPeerAvatarUrl,
  } = useLocalSearchParams<{ id?: string; name?: string; peerId?: string; peerAvatarUrl?: string }>();
  const userId = currentUser?.id;
  const peerId = getRouteParam(rawPeerId) ?? '';
  const routePeerAvatarUrl = getRouteParam(rawPeerAvatarUrl)?.trim() ?? '';
  const routeConversationId = getRouteParam(conversationId) ?? '';
  const [activeConversationId, setActiveConversationId] = useState(
    UUID_PATTERN.test(routeConversationId) ? routeConversationId : '',
  );

  const resolvedPeerAvatarUrl = peerAvatarUrl.length > 0 ? peerAvatarUrl : null;
  const themAvatar = !peerAvatarLoadFailed && resolvedPeerAvatarUrl
    ? { uri: resolvedPeerAvatarUrl }
    : assets.avatar1 ?? assets.avatar2;

  useEffect(() => {
    setActiveConversationId(UUID_PATTERN.test(routeConversationId) ? routeConversationId : '');
  }, [routeConversationId]);

  useEffect(() => {
    setPeerAvatarUrl(routePeerAvatarUrl);
  }, [routePeerAvatarUrl]);

  useEffect(() => {
    setPeerAvatarLoadFailed(false);
  }, [resolvedPeerAvatarUrl]);

  useEffect(() => {
    if (routePeerAvatarUrl || !peerId) {
      return;
    }

    let isMounted = true;

    void (async () => {
      try {
        const profile = await UserService.getUser(peerId);
        if (!isMounted) {
          return;
        }

        const avatarUrl = profile.avatar_url?.trim() ?? '';
        if (avatarUrl) {
          setPeerAvatarUrl(avatarUrl);
        }
      } catch {
        // Keep the static fallback if the peer profile lookup fails.
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [peerId, routePeerAvatarUrl]);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!activeConversationId) return;

    try {
      const data = await ChatService.getMessages(activeConversationId);
      const nextMessages = data.map((message) => mapMessageRecord(message));
      setMessages((current) => mergeMessages(current, nextMessages));
    } catch (error) {
      if (!silent) {
        show('error', toUserMessage(error, 'Failed to load messages'));
      }
    }
  }, [activeConversationId, show]);

  // ---- Fetch connection between current user and peer (in either direction)
  const fetchConnection = useCallback(async (silent = false): Promise<Connection | null> => {
    if (!userId || !peerId) return null;
    try {
      const data = await ChatService.getConnection(peerId);
      setConnection(data);
      return data;
    } catch (error) {
      if (!silent) {
        show('error', toUserMessage(error, 'Failed to load connection'));
      }
      return null;
    }
  }, [peerId, show, userId]);

  const fetchBlockStatus = useCallback(async (silent = false) => {
    if (!peerId) return;
    try {
      const response = await SettingsService.getBlockStatus(peerId);
      setIsBlockedByMe(response.blocked);
    } catch (error) {
      if (!silent) {
        show('error', toUserMessage(error, 'Failed to load block status'));
      }
    }
  }, [peerId, show]);

  useEffect(() => {
    void (async () => {
      await fetchBlockStatus(true);
      await fetchConnection();
      if (activeConversationId) {
        await fetchMessages();
      }
    })();
  }, [activeConversationId, fetchBlockStatus, fetchConnection, fetchMessages]);

  // ---- When connection is pending and current user is the addressee, show accept sheet
  useEffect(() => {
    if (!connection || connection.status !== 'pending') {
      setShowAccept(false);
      return;
    }
    const iAmAddressee = connection.addressee_id === userId;
    setShowAccept(iAmAddressee);
  }, [connection, userId]);

  const ensureConnection = useCallback(async (): Promise<Connection | null> => {
    if (connection) return connection;

    const existing = await fetchConnection();
    if (existing) return existing;

    if (!userId || !peerId) return null;

    try {
      const data = await ChatService.ensureConnection(peerId);
      setConnection(data);
      return data;
    } catch (error) {
      show('error', getConnectionErrorMessage(error));
      return null;
    }
  }, [connection, fetchConnection, peerId, show, userId]);

  useFocusEffect(
    useCallback(() => {
      if (peerId) {
        void fetchBlockStatus(true);
        void fetchConnection(true);
      }
      if (activeConversationId) {
        void fetchMessages(true);
      }
      return undefined;
    }, [activeConversationId, fetchBlockStatus, fetchConnection, fetchMessages, peerId]),
  );

  useEffect(() => {
    if (!lastEvent) {
      return;
    }

    if (
      lastEvent.type === 'message_created'
      || lastEvent.type === 'messages_read'
      || lastEvent.type === 'notification_updated'
    ) {
      if (activeConversationId) {
        void fetchMessages(true);
      }
      if (peerId) {
        void fetchBlockStatus(true);
        void fetchConnection(true);
      }
      return;
    }

    if (lastEvent.type === 'connection_updated') {
      if (peerId) {
        void fetchBlockStatus(true);
        void fetchConnection(true);
      }
      if (activeConversationId) {
        void fetchMessages(true);
      }
    }
  }, [activeConversationId, eventTick, fetchBlockStatus, fetchConnection, fetchMessages, lastEvent, peerId]);

  // ✅ send message (ensures connection exists + writes both records)
  const sendMessage = async () => {
    const content = text.trim();
    if (!content || !userId || !peerId) return;

    const activeConnection = await ensureConnection();
    if (!activeConnection) return;

    if (activeConnection.status === 'blocked' || activeConnection.status === 'declined') {
      return show('error', 'You cannot send messages to this user.');
    }

    const isPendingAddressee = activeConnection.status === 'pending' && activeConnection.addressee_id === userId;
    if (isPendingAddressee) {
      setShowAccept(true);
      show('info', 'Accept the request to reply.');
      return;
    }

    let nextConversationId = activeConversationId;
    if (!nextConversationId) {
      try {
        const conversation = await ChatService.ensureConversation(peerId);
        nextConversationId = conversation.id;
        setActiveConversationId(conversation.id);
      } catch (error) {
        show('error', toUserMessage(error, 'Failed to start conversation'));
        return;
      }
    }

    try {
      const savedMessage = await ChatService.sendMessage(nextConversationId, content);
      setMessages((prev) =>
        prev.some((message) => message.id === savedMessage.id)
          ? prev
          : [...prev, mapMessageRecord(savedMessage)],
      );
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to send message'));
      return;
    }

    if (activeConnection.status === 'pending' && activeConnection.requester_id === userId) {
      // The new request is visible in chat state and notification center; avoid extra toast noise.
    }

    setText('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  // ✅ accept / decline handlers
  const acceptRequest = async () => {
    if (!connection) return;
    setBusyAction(true);
    try {
      await ChatService.acceptConnection(connection.id);
      await Promise.all([fetchConnection(), fetchMessages()]);
    } catch (error) {
      setBusyAction(false);
      show('error', toUserMessage(error, 'Failed to accept request'));
      return;
    }
    setBusyAction(false);
    setShowAccept(false);
  };

  const declineRequest = async () => {
    if (!connection) return;
    setBusyAction(true);
    try {
      await ChatService.declineConnection(connection.id);
      await Promise.all([fetchConnection(), fetchMessages()]);
    } catch (error) {
      setBusyAction(false);
      show('error', toUserMessage(error, 'Failed to decline request'));
      return;
    }
    setBusyAction(false);
    setShowAccept(false);
  };

  // ✅ group by date for FlatList
  const flatData = useMemo(() => groupMessagesByDate(messages), [messages]);
  const latestMessageId = useMemo(
    () => (messages.length > 0 ? messages[messages.length - 1]?.id ?? null : null),
    [messages],
  );
  const latestSeenOutgoingMessageId = useMemo(() => {
    const latestSeenOutgoingMessage = [...messages]
      .reverse()
      .find((message) => message.sender_id === userId && message.read_at);

    return latestSeenOutgoingMessage?.id ?? null;
  }, [messages, userId]);

  useEffect(() => {
    if (!selectedMessageId || selectedMessageId !== latestMessageId) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [latestMessageId, selectedMessageId]);

  const formatAbsoluteMessageDate = useCallback((iso: string) => (
    new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  ), []);

  const formatRelativeSeenDate = useCallback((iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) {
      return 'Seen just now';
    }

    if (diffMinutes < 60) {
      return `Seen ${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Seen ${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `Seen ${diffDays}d ago`;
    }

    return `Seen ${formatAbsoluteMessageDate(iso)}`;
  }, [formatAbsoluteMessageDate]);
  const canType = !isBlockedByMe && (connection?.status === 'accepted' || !connection); // allow typing to create request
  const isPendingAddressee = connection?.status === 'pending' && connection.addressee_id === userId;

  return (
    <Block color={colors.background}>
      {/* header */}
      <Block
        flex={0}
        row
        align="flex-start"
        color={colors.white}
        paddingHorizontal={sizes.s}
      >
        {/* Left side */}
        <Block row align="center">
          <Button row flex={0} justify="center" width={0} onPress={() => router.back()}>
            <Image radius={0} width={10} height={18} color={colors.gray} source={assets.arrow} transform={[{ rotate: '180deg' }]} />
          </Button>
          <Image
            source={themAvatar}
            width={28}
            height={28}
            radius={14}
            marginRight={sizes.s}
            onError={() => setPeerAvatarLoadFailed(true)}
          />
          <Text h5>{name}</Text>
        </Block>

        {/* Right side */}
        <Block row align="center" />
        {/* FIX: pass peerId to MoreMenu, not my own id */}
        <Button onPress={() => setMenuOpen((prev) => !prev)}>
          <Image radius={0} width={20} height={20} source={assets.more} color={colors.text} />
        </Button>
      </Block>

      {/* messages */}
      <Block flex={1} marginBottom={10}>
        <FlatList
          ref={listRef}
          data={flatData}
          keyExtractor={(item, idx) => (item.type === 'header' ? `h-${item.header}-${idx}` : item.id)}
          contentContainerStyle={{ paddingHorizontal: sizes.m, paddingBottom: sizes.s, paddingTop: sizes.s }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === 'header') return <DateDivider title={item.header} />;
            const m = item;
            const isSelected = selectedMessageId === m.id;
            const isLatestSeenOutgoingMessage = m.id === latestSeenOutgoingMessageId;
            const isLatestMessageInChat = m.id === latestMessageId;
            const showSeenRow = isLatestMessageInChat && isLatestSeenOutgoingMessage;
            const sentAtLabel = formatAbsoluteMessageDate(m.at);
            const seenLabel = showSeenRow && m.read_at
              ? formatRelativeSeenDate(m.read_at)
              : '';

            return (
              <Block marginBottom={sizes.m}>
                {isSelected ? (
                  <TimeStamp
                    label={sentAtLabel}
                    align={m.sender_id === userId ? 'right' : 'left'}
                  />
                ) : null}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setSelectedMessageId((current) => current === m.id ? null : m.id)}
                >
                  <Bubble m={m} userId={userId!} />
                </TouchableOpacity>
                {showSeenRow && seenLabel ? (
                  <Block>
                    {isSelected ? (
                      <TimeStamp
                        label={seenLabel}
                        align={m.sender_id === userId ? 'right' : 'left'}
                      />
                    ) : null}
                    <TimeStamp
                      label=""
                      align={m.sender_id === userId ? 'right' : 'left'}
                      seen
                      seenAvatar={themAvatar}
                      avatarOnly
                    />
                  </Block>
                ) : null}
              </Block>
            );
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      </Block>

      {/* input bar */}
      {isBlockedByMe ? (
        <Block
          flex={0}
          color={colors.card}
          radius={sizes.cardRadius || 16}
          paddingHorizontal={sizes.m}
          paddingVertical={sizes.s}
          marginHorizontal={sizes.m}
          marginBottom={sizes.md}
        >
          <Text p semibold color={colors.gray}>You blocked this user.</Text>
          <Text size={12} color={colors.gray} marginTop={2}>
            Previous messages stay visible, but you can’t send new ones.
          </Text>
        </Block>
      ) : (
        <Block
          row
          flex={0}
          align="center"
          style={{ marginHorizontal: sizes.m, marginBottom: sizes.md, paddingHorizontal: sizes.s, paddingVertical: sizes.s }}
        >
          <Block flex={1} marginHorizontal={sizes.s}>
            <Input
              placeholder={isPendingAddressee ? "Accept the request to reply…" : "Enter your message"}
              value={text}
              onChangeText={setText}
              multiline
              editable={canType && !isPendingAddressee}
            />
          </Block>
          <Button
            gradient={gradients.dark}
            style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
            onPress={sendMessage}
            disabled={!canType || isPendingAddressee}
          >
            <Image source={assets.arrow} width={16} height={16} color={colors.white} transform={[{ rotate: '315deg' }]} />
          </Button>
        </Block>
      )}

      {/* menus & sheets */}
      <MoreMenu
        targetUserId={peerId || String(name)}   // <-- pass the OTHER user id here (fallback if needed)
        visible={menuOpen}
        chatId={activeConversationId}
        onClose={() => setMenuOpen(false)}
      />

      {/* Accept sheet (overlay) */}
      <AcceptMessage
        visible={showAccept}
        message={`Accept message request from ${name}?`}
        actionLabel="Accept"
        onAction={acceptRequest}
        onDecline={declineRequest}
        onClose={() => setShowAccept(false)}
        loading={busyAction}
      />
    </Block>
  );
}
