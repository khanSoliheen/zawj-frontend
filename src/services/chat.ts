import ApiService from '@/services/api';

export type ConversationSummary = {
  id: string;
  peer_id: string;
  peer_first_name: string;
  peer_last_name: string;
  peer_gender: string;
  peer_avatar_url?: string | null;
  peer_is_online?: boolean;
  last_message?: string | null;
  last_message_at?: string | null;
  unread: boolean;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
};

export type Connection = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
  created_at?: string;
};

export type MessageRow = {
  id: string;
  sender_id: string;
  content: string;
  avatar?: string | null;
  read_at?: string | null;
  created_at: string;
};

class ChatService {
  static async getConversations() {
    return ApiService.get<ConversationSummary[]>('/conversations');
  }

  static async ensureConversation(peerId: string) {
    return ApiService.post<{ id: string }, { peer_id: string }>('/conversations/ensure', {
      peer_id: peerId,
    });
  }

  static async getConnection(peerId: string) {
    return ApiService.get<Connection | null>(`/connections/${peerId}`);
  }

  static async ensureConnection(peerId: string) {
    return ApiService.post<Connection, { peer_id: string }>('/connections/ensure', {
      peer_id: peerId,
    });
  }

  static async acceptConnection(connectionId: string) {
    return ApiService.post<{ message: string }>(`/connections/${connectionId}/accept`);
  }

  static async declineConnection(connectionId: string) {
    return ApiService.post<{ message: string }>(`/connections/${connectionId}/decline`);
  }

  static async getMessages(conversationId: string) {
    return ApiService.get<MessageRow[]>(`/conversations/${conversationId}/messages`);
  }

  static async updateTyping(conversationId: string, isTyping: boolean) {
    return ApiService.post<{ message: string }, { is_typing: boolean }>(
      `/conversations/${conversationId}/typing`,
      { is_typing: isTyping },
    );
  }

  static async sendMessage(conversationId: string, content: string) {
    return ApiService.post<MessageRow, { content: string }>(
      `/conversations/${conversationId}/messages`,
      { content },
    );
  }
}

export default ChatService;
