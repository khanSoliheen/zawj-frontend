// components/MoreMenu.tsx
import { router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { ROUTES } from '@/constants/routes';

import Block from './block';
import Button from './button';
import Image from './image';
import Modal from './modal';
import Text from './text';
import { useData } from '../hooks/useData';

type Props = {
  targetUserId: string;
  chatId?: string;                 // pass when used from chat
  onClose?: () => void;
  visible: boolean;
};

export default function MoreMenu({ targetUserId, chatId, visible, onClose }: Props) {
  const { theme } = useData();
  const { colors, sizes, assets } = theme;

  const goReport = () => {
    // prefill reported_user_id + context
    router.push({
      pathname: ROUTES.SETTINGS_REPORT,
      params: {
        reported_user_id: targetUserId,
        context: chatId ? "Chat" : "Profile",
        chat_id: chatId ?? "",
      },
    });
    onClose?.();
  };

  const goBlock = () => {
    router.push({
      pathname: ROUTES.SETTINGS_USER_BLOCK,
      params: {
        user_id: targetUserId,
        context: chatId ? "Chat" : "Profile",
        chat_id: chatId ?? "",
      },
    });
    onClose?.();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      {/* dim backdrop */}
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={onClose} />
      {/* sheet */}
      <Block
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        color={colors.card}
        paddingHorizontal={sizes.padding}
        paddingVertical={sizes.m}
        radius={16}
      >
        <Button onPress={goReport}>
          <Block row align="center" paddingVertical={sizes.s}>
            <Image radius={0} width={18} height={18} source={assets.apple} color={colors.danger} />
            <Text p semibold marginLeft={sizes.s} color={colors.danger}>Report user</Text>
          </Block>
        </Button>

        <Button onPress={goBlock}>
          <Block row align="center" paddingVertical={sizes.s}>
            <Image radius={0} width={18} height={18} source={assets.apple} color={colors.text} />
            <Text p semibold marginLeft={sizes.s}>Block user</Text>
          </Block>
        </Button>

        <Button onPress={onClose}>
          <Block row align="center" justify="center" paddingVertical={sizes.s}>
            <Text p color={colors.link}>Cancel</Text>
          </Block>
        </Button>
      </Block>
    </Modal>
  );
}
