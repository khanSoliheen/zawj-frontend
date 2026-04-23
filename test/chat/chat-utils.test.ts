/* global describe, it, expect */

import { mapConversationToChatItem, mapMessageRecord, groupMessagesByDate } from '@/chat/chat-utils';

describe('chat utils', () => {
  it('maps a raw message record into the chat message shape', () => {
    expect(mapMessageRecord({
      id: 'msg-1',
      message: null,
      content: 'Assalamu alaikum',
      created_at: '2026-01-10T10:00:00.000Z',
      sender_id: 'user-1',
      avatar: null,
    })).toEqual({
      id: 'msg-1',
      text: 'Assalamu alaikum',
      at: '2026-01-10T10:00:00.000Z',
      sender_id: 'user-1',
      avatar: null,
      read_at: null,
    });
  });

  it('groups messages into dated flat list rows in chronological order', () => {
    const rows = groupMessagesByDate([
      {
        id: 'msg-2',
        text: 'Second day',
        at: '2026-01-11T09:00:00.000Z',
        sender_id: 'user-1',
      },
      {
        id: 'msg-1',
        text: 'First day',
        at: '2026-01-10T09:00:00.000Z',
        sender_id: 'user-2',
      },
    ]);

    expect(rows[0]).toMatchObject({ type: 'header' });
    expect(rows[1]).toMatchObject({ type: 'msg', id: 'msg-1' });
    expect(rows[2]).toMatchObject({ type: 'header' });
    expect(rows[3]).toMatchObject({ type: 'msg', id: 'msg-2' });
  });

  it('maps a conversation into the current user chat list item', () => {
    const avatar = 1;

    expect(mapConversationToChatItem({
      id: 'conversation-1',
      user1: 'me',
      user2: 'peer',
      user1_profile: { first_name: 'Current', last_name: 'User' },
      user2_profile: { first_name: 'Fatima', last_name: 'Ali' },
      messages: [
        {
          content: 'Latest message',
          created_at: '2026-01-10T10:00:00.000Z',
        },
      ],
    }, 'me', avatar)).toMatchObject({
      id: 'conversation-1',
      peerId: 'peer',
      name: 'Fatima Ali',
      lastMessage: 'Latest message',
      avatar,
    });
  });

  it('returns null for conversations without messages', () => {
    expect(mapConversationToChatItem({
      id: 'conversation-2',
      user1: 'me',
      user2: 'peer',
      user1_profile: null,
      user2_profile: null,
      messages: [],
    }, 'me', 1)).toBeNull();
  });
});
