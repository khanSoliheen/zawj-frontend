import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/hooks/userContext';
import { API_TOKEN_KEY, WS_BASE_URL } from '@/services/api';
import SettingsService, { type NotificationSummary } from '@/services/settings';

type RealtimeEvent =
  | { type: 'message_created'; conversation_id: string; sender_id: string; message_id: string }
  | { type: 'messages_read'; conversation_id: string }
  | { type: 'connection_updated'; peer_id: string; status: string }
  | { type: 'typing_updated'; conversation_id: string; user_id: string; is_typing: boolean }
  | { type: 'presence_updated'; user_id: string; is_online: boolean }
  | { type: 'notification_updated' };

type RealtimeContextValue = {
  isConnected: boolean;
  summary: NotificationSummary;
  lastEvent: RealtimeEvent | null;
  eventTick: number;
  refreshSummary: (silent?: boolean) => Promise<void>;
};

const defaultSummary: NotificationSummary = {
  unread_chat_count: 0,
  pending_message_request_count: 0,
  photo_request_count: 0,
  unread_match_count: 0,
  unread_interest_count: 0,
  unread_billing_count: 0,
};

const RealtimeContext = createContext<RealtimeContextValue>({
  isConnected: false,
  summary: defaultSummary,
  lastEvent: null,
  eventTick: 0,
  refreshSummary: async () => { },
});

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary>(defaultSummary);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventTick, setEventTick] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshSummary = useCallback(async (silent = false) => {
    if (!currentUser) {
      setSummary(defaultSummary);
      return;
    }

    try {
      const nextSummary = await SettingsService.getNotificationSummary();
      setSummary(nextSummary);
    } catch {
      if (!silent) {
        setSummary(defaultSummary);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    let disposed = false;

    const closeSocket = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      socketRef.current?.close();
      socketRef.current = null;
      setIsConnected(false);
    };

    const connect = async () => {
      if (!currentUser) {
        closeSocket();
        setSummary(defaultSummary);
        return;
      }

      const token = await AsyncStorage.getItem(API_TOKEN_KEY);

      if (!token || disposed) {
        return;
      }

      const socket = new WebSocket(`${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (disposed) {
          socket.close();
          return;
        }
        setIsConnected(true);
        void refreshSummary(true);
      };

      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data as string) as RealtimeEvent;
          setLastEvent(event);
          setEventTick((current) => current + 1);
          void refreshSummary(true);
        } catch {
          // ignore malformed frames
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (!disposed && currentUser) {
          reconnectTimerRef.current = setTimeout(() => {
            void connect();
          }, 2000);
        }
      };
    };

    void connect();

    return () => {
      disposed = true;
      closeSocket();
    };
  }, [currentUser, refreshSummary]);

  const value = useMemo(() => ({
    isConnected,
    summary,
    lastEvent,
    eventTick,
    refreshSummary,
  }), [eventTick, isConnected, lastEvent, refreshSummary, summary]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
