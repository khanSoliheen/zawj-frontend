import type { ImageSourcePropType } from 'react-native';

export type ChatMessage = {
  id: string;
  text: string;
  at: string;
  sender_id: string;
  avatar?: string | null;
  read_at?: string | null;
};

export type MessageRecord = {
  id: string;
  message?: string | null;
  content?: string | null;
  created_at: string;
  sender_id: string;
  avatar?: string | null;
  read_at?: string | null;
};

export type MessageListItem = { type: 'header'; header: string } | ({ type: 'msg' } & ChatMessage);

type ConversationMessagePreview = {
  content?: string | null;
  created_at?: string | null;
};

type ConversationProfile = {
  first_name?: string | null;
  last_name?: string | null;
};

export type ChatListItem = {
  id: string;
  peerId: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: ImageSourcePropType;
  unread?: boolean;
  status?: 'pending' | 'accepted' | 'blocked' | 'declined';
};

export type ConversationRecord = {
  id: string;
  user1: string;
  user2: string;
  user1_profile?: ConversationProfile | ConversationProfile[] | null;
  user2_profile?: ConversationProfile | ConversationProfile[] | null;
  messages: ConversationMessagePreview[];
};

export const formatMessageDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const mapMessageRecord = (message: MessageRecord): ChatMessage => ({
  id: message.id,
  text: message.message ?? message.content ?? '',
  at: message.created_at,
  sender_id: message.sender_id,
  avatar: message.avatar ?? null,
  read_at: message.read_at ?? null,
});

export const groupMessagesByDate = (messages: ChatMessage[]) => {
  const groups: Record<string, ChatMessage[]> = {};

  messages.forEach((message) => {
    const header = formatMessageDate(message.at);
    if (!groups[header]) {
      groups[header] = [];
    }
    groups[header].push(message);
  });

  const rows: MessageListItem[] = [];
  Object.entries(groups)
    .sort((a, b) => new Date(a[1][0].at).getTime() - new Date(b[1][0].at).getTime())
    .forEach(([header, groupedMessages]) => {
      rows.push({ type: 'header', header });
      groupedMessages.forEach((message) => rows.push({ type: 'msg', ...message }));
    });

  return rows;
};

export const mapConversationToChatItem = (
  conversation: ConversationRecord,
  userId: string,
  avatar: ImageSourcePropType,
): ChatListItem | null => {
  const latestMessage = conversation.messages[0];

  if (!latestMessage) {
    return null;
  }

  const isCurrentUserFirstParticipant = conversation.user1 === userId;
  const otherUserProfile = isCurrentUserFirstParticipant
    ? conversation.user2_profile
    : conversation.user1_profile;
  const profileData = Array.isArray(otherUserProfile) ? otherUserProfile[0] : otherUserProfile;
  const peerId = isCurrentUserFirstParticipant ? conversation.user2 : conversation.user1;
  const firstName = profileData?.first_name?.trim() ?? 'User';
  const lastName = profileData?.last_name?.trim() ?? '';

  return {
    id: conversation.id,
    peerId,
    name: `${firstName} ${lastName}`.trim(),
    lastMessage: latestMessage.content || 'No messages yet',
    time: latestMessage.created_at
      ? new Date(latestMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    avatar,
  };
};
