import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { useData, useRealtime } from '@/hooks';

import Block from './block';
import Image from './image';
import Text from './text';

type NotificationBellButtonProps = {
  size?: number;
};

const NotificationBellButton = ({ size = 22 }: NotificationBellButtonProps) => {
  const { theme } = useData();
  const { summary } = useRealtime();
  const { colors, assets } = theme;
  const notificationCount =
    summary.photo_request_count
    + summary.unread_match_count
    + summary.pending_message_request_count
    + summary.unread_chat_count;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(ROUTES.NOTIFICATIONS_CENTER)}
    >
      <Block flex={0}>
        <Image
          source={assets.bell}
          color={colors.text}
          width={size}
          height={size}
          radius={0}
        />
        {notificationCount > 0 ? (
          <Block
            flex={0}
            color={colors.primary}
            radius={9}
            width={18}
            height={18}
            align="center"
            justify="center"
            style={{ position: 'absolute', right: -6, top: -6 }}
          >
            <Text size={10} color={colors.white} semibold>
              {notificationCount > 9 ? '9+' : String(notificationCount)}
            </Text>
          </Block>
        ) : null}
      </Block>
    </TouchableOpacity>
  );
};

export default NotificationBellButton;
