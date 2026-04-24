import ApiService from '@/services/api';

export type NotificationPrefs = {
  push: boolean;
  messages: boolean;
  matches: boolean;
  marketing: boolean;
  sounds: boolean;
};

export type VisibilityPrefs = {
  discoverable: boolean;
  messages_from: 'everyone' | 'matches';
  read_receipts: boolean;
  photo_visibility: 'everyone' | 'approved_only' | 'hidden';
};

export type PhotoAccessRequestRow = {
  viewer_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  requested_at: string;
};

export type NotificationSummary = {
  unread_chat_count: number;
  pending_message_request_count: number;
  photo_request_count: number;
  unread_match_count: number;
};

export type MatchNotificationItem = {
  id: string;
  user_id?: string | null;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
};

export type MessageRequestNotificationItem = {
  connection_id: string;
  user_id: string;
  conversation_id?: string | null;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
};

export type UnreadMessageNotificationItem = {
  conversation_id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  message_preview: string;
  created_at: string;
};

export type NotificationCenterResponse = {
  unread_chat_count: number;
  pending_message_request_count: number;
  unread_match_count: number;
  photo_request_count: number;
  photo_requests: PhotoAccessRequestRow[];
  message_requests: MessageRequestNotificationItem[];
  matches: MatchNotificationItem[];
  unread_messages: UnreadMessageNotificationItem[];
};

export type MatchPreferences = {
  min_age?: number | null;
  max_age?: number | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  education?: string | null;
  prayer_regularity?: string | null;
  quran_level?: string | null;
  marital_status?: string | null;
};

export type BlockedUserRow = {
  blocked_user_id: string;
  created_at?: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

export type BlockStatusResponse = {
  blocked: boolean;
};

export type SessionInfoResponse = {
  user_email: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
};

export type SessionListItem = {
  id: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  user_agent?: string | null;
  is_current: boolean;
};

export type ReportPayload = {
  category: string;
  details: string;
  reported_user_id?: string | null;
  contact_ok: boolean;
};

export type SupportPayload = {
  subject: string;
  message: string;
  email: string;
  app_version?: string;
  platform?: string;
};

export type PushTokenPayload = {
  token: string;
  platform: string;
  device_name?: string | null;
};

class SettingsService {
  static async getNotificationSettings() {
    return ApiService.get<NotificationPrefs>('/settings/notifications');
  }

  static async updateNotificationSettings(payload: NotificationPrefs) {
    return ApiService.put<NotificationPrefs, NotificationPrefs>('/settings/notifications', payload);
  }

  static async getMatchPreferences() {
    return ApiService.get<MatchPreferences>('/settings/preferences');
  }

  static async updateMatchPreferences(payload: MatchPreferences) {
    return ApiService.put<MatchPreferences, MatchPreferences>('/settings/preferences', payload);
  }

  static async getVisibilitySettings() {
    return ApiService.get<VisibilityPrefs>('/settings/visibility');
  }

  static async updateVisibilitySettings(payload: VisibilityPrefs) {
    return ApiService.put<VisibilityPrefs, VisibilityPrefs>('/settings/visibility', payload);
  }

  static async getPhotoRequests() {
    return ApiService.get<PhotoAccessRequestRow[]>('/settings/photo-requests');
  }

  static async getNotificationSummary() {
    return ApiService.get<NotificationSummary>('/settings/notification-summary');
  }

  static async getNotificationCenter() {
    return ApiService.get<NotificationCenterResponse>('/settings/notification-center');
  }

  static async markNotificationCenterSeen() {
    return ApiService.post<{ message: string }>('/settings/notification-center/seen');
  }

  static async requestPhotoAccess(userId: string) {
    return ApiService.post<{ message: string }, { user_id: string }>('/settings/photo-access/request', {
      user_id: userId,
    });
  }

  static async approvePhotoAccess(userId: string) {
    return ApiService.post<{ message: string }>(`/settings/photo-access/${userId}/approve`);
  }

  static async rejectPhotoAccess(userId: string) {
    return ApiService.post<{ message: string }>(`/settings/photo-access/${userId}/reject`);
  }

  static async getBlockedUsers() {
    return ApiService.get<BlockedUserRow[]>('/settings/blocked-users');
  }

  static async getBlockStatus(userId: string) {
    return ApiService.get<BlockStatusResponse>(`/settings/block-status/${userId}`);
  }

  static async blockUser(userId: string) {
    return ApiService.post<{ message: string }, { user_id: string }>('/settings/block-user', {
      user_id: userId,
    });
  }

  static async unblockUser(userId: string) {
    return ApiService.delete<{ message: string }>(`/settings/block-user/${userId}`);
  }

  static async getSessionInfo() {
    return ApiService.get<SessionInfoResponse>('/settings/session');
  }

  static async getSessions() {
    return ApiService.get<SessionListItem[]>('/settings/sessions');
  }

  static async revokeSession(sessionId: string) {
    return ApiService.delete<{ message: string }>(`/settings/session/${encodeURIComponent(sessionId)}`);
  }

  static async registerPushToken(payload: PushTokenPayload) {
    return ApiService.post<{ message: string }, PushTokenPayload>('/settings/push-token', payload);
  }

  static async deletePushToken(token: string) {
    return ApiService.delete<{ message: string }>(`/settings/push-token/${encodeURIComponent(token)}`);
  }

  static async logoutOtherSessions() {
    return ApiService.post<{ message: string }>('/settings/session/logout-others');
  }

  static async createReport(payload: ReportPayload) {
    return ApiService.post<{ message: string }, ReportPayload>('/reports', payload);
  }

  static async createSupportTicket(payload: SupportPayload) {
    return ApiService.post<{ message: string }, SupportPayload>('/support', payload);
  }
}

export default SettingsService;
