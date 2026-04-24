import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import { Block, Button, Image, Text } from '@/components';
import { buildChatRoute, buildUserRoute } from '@/constants/routes';
import { useData, useToast } from '@/hooks';
import ChatService from '@/services/chat';
import SettingsService, {
  type MatchNotificationItem,
  type MessageRequestNotificationItem,
  type PhotoAccessRequestRow,
  type UnreadMessageNotificationItem,
} from '@/services/settings';
import { toUserMessage } from '@/utils/errors';

type NotificationState = {
  unreadChatCount: number;
  pendingMessageRequestCount: number;
  unreadMatchCount: number;
  photoRequestCount: number;
  photoRequests: PhotoAccessRequestRow[];
  messageRequests: MessageRequestNotificationItem[];
  matches: MatchNotificationItem[];
  unreadMessages: UnreadMessageNotificationItem[];
};

const EMPTY_STATE: NotificationState = {
  unreadChatCount: 0,
  pendingMessageRequestCount: 0,
  unreadMatchCount: 0,
  photoRequestCount: 0,
  photoRequests: [],
  messageRequests: [],
  matches: [],
  unreadMessages: [],
};

const formatRelativeTime = (value: string) => {
  const createdAt = new Date(value);
  const diffMs = Date.now() - createdAt.getTime();

  if (Number.isNaN(createdAt.getTime()) || diffMs < 0) {
    return 'recently';
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function NotificationsCenter() {
  const { theme } = useData();
  const { show } = useToast();
  const { assets, colors, sizes } = theme;
  const [state, setState] = useState<NotificationState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const response = await SettingsService.getNotificationCenter();
      setState({
        unreadChatCount: response.unread_chat_count,
        pendingMessageRequestCount: response.pending_message_request_count,
        unreadMatchCount: response.unread_match_count,
        photoRequestCount: response.photo_request_count,
        photoRequests: response.photo_requests,
        messageRequests: response.message_requests,
        matches: response.matches,
        unreadMessages: response.unread_messages,
      });

      if (response.unread_match_count > 0) {
        void SettingsService.markNotificationCenterSeen();
      }
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to load notifications'));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [show]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const openChat = ({
    conversationId,
    userId,
    fullName,
    avatarUrl,
  }: {
    conversationId?: string | null;
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
  }) => {
    router.push({
      pathname: buildChatRoute(conversationId && conversationId.length > 0 ? conversationId : 'new'),
      params: {
        name: fullName,
        peerId: userId,
        peerAvatarUrl: avatarUrl ?? '',
      },
    });
  };

  const handleMessageRequestDecision = async (
    connectionId: string,
    action: 'accept' | 'decline',
  ) => {
    if (busyId) return;
    setBusyId(connectionId);
    try {
      if (action === 'accept') {
        await ChatService.acceptConnection(connectionId);
      } else {
        await ChatService.declineConnection(connectionId);
      }
      await loadNotifications(true);
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to update message request'));
    } finally {
      setBusyId(null);
    }
  };

  const handlePhotoRequestDecision = async (
    viewerId: string,
    action: 'approve' | 'reject',
  ) => {
    if (busyId) return;
    setBusyId(viewerId);
    try {
      if (action === 'approve') {
        await SettingsService.approvePhotoAccess(viewerId);
      } else {
        await SettingsService.rejectPhotoAccess(viewerId);
      }
      await loadNotifications(true);
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to update photo request'));
    } finally {
      setBusyId(null);
    }
  };

  const Card = ({
    avatarUrl,
    title,
    body,
    timestamp,
    onPress,
    children,
  }: {
    avatarUrl?: string | null;
    title: string;
    body: string;
    timestamp: string;
    onPress?: () => void;
    children?: React.ReactNode;
  }) => (
    <Button
      onPress={onPress}
      disabled={!onPress}
      style={{ marginBottom: sizes.s }}
    >
      <Block
        color={colors.card}
        radius={sizes.cardRadius || 16}
        padding={sizes.m}
        shadow
      >
        <Block row align="center">
          <Image
            source={avatarUrl ? { uri: avatarUrl } : assets.avatar1}
            width={48}
            height={48}
            radius={24}
            marginRight={sizes.s}
          />
          <Block flex={1} align="flex-start">
            <Text p semibold>{title}</Text>
            <Text size={12} color={colors.gray} marginTop={2}>
              {body}
            </Text>
            <Text size={12} color={colors.gray} marginTop={2}>
              {timestamp}
            </Text>
          </Block>
        </Block>
        {children}
      </Block>
    </Button>
  );

  const hasNotifications =
    state.messageRequests.length > 0
    || state.photoRequests.length > 0
    || state.matches.length > 0
    || state.unreadMessages.length > 0;

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      <Block row flex={0} align="center" justify="space-between" paddingVertical={sizes.s} marginBottom={sizes.sm}>
        <Button onPress={() => router.back()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.text}
            source={assets.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
        <Text h5 semibold>Notifications</Text>
        <Block width={24} />
      </Block>

      <Block scroll showsVerticalScrollIndicator={false} paddingHorizontal={sizes.md}>
        {loading ? (
          <Block color={colors.card} radius={sizes.cardRadius || 16} padding={sizes.m}>
            <Text p>Loading notifications…</Text>
          </Block>
        ) : !hasNotifications ? (
          <Block color={colors.card} radius={sizes.cardRadius || 16} padding={sizes.m} shadow>
            <Text p semibold>No notifications yet</Text>
            <Text p color={colors.gray} marginTop={sizes.xs}>
              Message requests, photo requests, matches, and unread messages will show up here.
            </Text>
          </Block>
        ) : (
          <>
            {state.messageRequests.length > 0 ? (
              <>
                <Text h6 semibold marginBottom={sizes.s}>Message requests</Text>
                {state.messageRequests.map((request) => (
                  <Card
                    key={request.connection_id}
                    avatarUrl={request.avatar_url}
                    title={request.full_name}
                    body="Sent you a first message request"
                    timestamp={formatRelativeTime(request.created_at)}
                    onPress={() => openChat({
                      conversationId: request.conversation_id,
                      userId: request.user_id,
                      fullName: request.full_name,
                      avatarUrl: request.avatar_url,
                    })}
                  >
                    <Block row flex={0} marginTop={sizes.m}>
                      <Button
                        flex={1}
                        color={colors.primary}
                        shadow={false}
                        paddingVertical={sizes.s}
                        onPress={() => void handleMessageRequestDecision(request.connection_id, 'accept')}
                        disabled={busyId === request.connection_id}
                      >
                        <Text p semibold color={colors.white}>
                          {busyId === request.connection_id ? 'Working…' : 'Accept'}
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        outlined={colors.gray as string}
                        shadow={false}
                        paddingVertical={sizes.s}
                        marginLeft={sizes.s}
                        onPress={() => void handleMessageRequestDecision(request.connection_id, 'decline')}
                        disabled={busyId === request.connection_id}
                      >
                        <Text p semibold color={colors.gray}>Decline</Text>
                      </Button>
                    </Block>
                  </Card>
                ))}
              </>
            ) : null}

            {state.photoRequests.length > 0 ? (
              <>
                <Text h6 semibold marginTop={sizes.m} marginBottom={sizes.s}>Photo requests</Text>
                {state.photoRequests.map((request) => (
                  <Card
                    key={request.viewer_id}
                    avatarUrl={request.avatar_url}
                    title={request.full_name || 'User'}
                    body="Requested access to view your photo"
                    timestamp={formatRelativeTime(request.requested_at)}
                    onPress={() => router.push(buildUserRoute(request.viewer_id))}
                  >
                    <Block row flex={0} marginTop={sizes.m}>
                      <Button
                        flex={1}
                        color={colors.primary}
                        shadow={false}
                        paddingVertical={sizes.s}
                        onPress={() => void handlePhotoRequestDecision(request.viewer_id, 'approve')}
                        disabled={busyId === request.viewer_id}
                      >
                        <Text p semibold color={colors.white}>
                          {busyId === request.viewer_id ? 'Working…' : 'Approve'}
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        outlined={colors.gray as string}
                        shadow={false}
                        paddingVertical={sizes.s}
                        marginLeft={sizes.s}
                        onPress={() => void handlePhotoRequestDecision(request.viewer_id, 'reject')}
                        disabled={busyId === request.viewer_id}
                      >
                        <Text p semibold color={colors.gray}>Decline</Text>
                      </Button>
                    </Block>
                  </Card>
                ))}
              </>
            ) : null}

            {state.matches.length > 0 ? (
              <>
                <Text h6 semibold marginTop={sizes.m} marginBottom={sizes.s}>New matches</Text>
                {state.matches.map((match) => (
                  <Card
                    key={match.id}
                    avatarUrl={match.avatar_url}
                    title={match.full_name}
                    body="You have a new match"
                    timestamp={formatRelativeTime(match.created_at)}
                    onPress={() => {
                      if (match.user_id) {
                        router.push(buildUserRoute(match.user_id));
                      }
                    }}
                  />
                ))}
              </>
            ) : null}

            {state.unreadMessages.length > 0 ? (
              <>
                <Text h6 semibold marginTop={sizes.m} marginBottom={sizes.s}>New messages</Text>
                {state.unreadMessages.map((message) => (
                  <Card
                    key={message.conversation_id}
                    avatarUrl={message.avatar_url}
                    title={message.full_name}
                    body={message.message_preview}
                    timestamp={formatRelativeTime(message.created_at)}
                    onPress={() => openChat({
                      conversationId: message.conversation_id,
                      userId: message.user_id,
                      fullName: message.full_name,
                      avatarUrl: message.avatar_url,
                    })}
                  />
                ))}
              </>
            ) : null}
          </>
        )}
      </Block>
    </Block>
  );
}
