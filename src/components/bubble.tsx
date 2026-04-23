import React, { useMemo } from 'react';

import type { ChatMessage as Message } from '@/chat/chat-utils';

import Block from './block';
import Text from './text';
import { useData } from '../hooks/useData';

type Props = {
  m: Message;
  userId: string | null | undefined;
};

export default function Bubble({ m, userId }: Props) {
  const { theme } = useData();
  const { sizes, colors } = theme;

  // --- normalize ids & fields ---
  const senderId = useMemo(() => String(m?.sender_id ?? '').trim(), [m?.sender_id]);
  const meId = useMemo(() => String(userId ?? '').trim(), [userId]);
  const isMe = senderId.length > 0 && meId.length > 0 && senderId === meId;

  const text = m.text;

  return (
    <Block row align="flex-end" flex={1} justify={isMe ? 'flex-end' : 'flex-start'} marginVertical={sizes.xs}>
      <Block
        flex={0}
        paddingHorizontal={sizes.sm}
        paddingVertical={sizes.s}
        color={isMe ? colors.facebook : colors.secondary}
        radius={sizes.sm}
        style={{
          maxWidth: sizes.width * 0.75,
          ...(isMe
            ? { borderTopRightRadius: 4 }
            : { borderTopLeftRadius: 4, borderWidth: 1, borderColor: colors.gray }),
        }}
      >
        <Text white>{text}</Text>
      </Block>
    </Block>
  );
}
