import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Block, Button, Text, Image } from "@/components";
import { useData, useToast } from "@/hooks";
import SettingsService, { type BlockedUserRow } from "@/services/settings";
import { toUserMessage } from "@/utils/errors";

const formatBlockedAt = (value?: string) => {
  if (!value) return 'Blocked recently';

  const blockedAt = new Date(value);
  const diffMs = Date.now() - blockedAt.getTime();
  if (Number.isNaN(blockedAt.getTime()) || diffMs < 0) {
    return 'Blocked recently';
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return 'Blocked just now';
  if (diffMinutes < 60) return `Blocked ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Blocked ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Blocked ${diffDays}d ago`;

  return `Blocked ${blockedAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
};

export default function BlockedUsers() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BlockedUserRow[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const blocked = await SettingsService.getBlockedUsers();
        setRows(blocked);
      } catch (error) {
        show("error", toUserMessage(error, "Failed to load blocked users"));
      } finally {
        setLoading(false);
      }
    })();
  }, [show]);

  const onUnblock = async (blockedId: string) => {
    const prevRows = rows;
    setRows((prev) => prev.filter((row) => row.blocked_user_id !== blockedId));
    try {
      await SettingsService.unblockUser(blockedId);
      show("success", "User unblocked");
    } catch (e) {
      setRows(prevRows);
      show("error", toUserMessage(e, 'Failed to unblock'));
    }
  };

  const Row = ({ row }: { row: BlockedUserRow }) => (
    <Block
      row
      align="center"
      justify="space-between"
      color={colors.card}
      radius={sizes.cardRadius || 16}
      padding={sizes.m}
      marginBottom={sizes.s}
      shadow
    >
      <Block row align="center" flex={1}>
        <Image
          radius={24}
          width={48}
          height={48}
          source={row.avatar_url ? { uri: row.avatar_url } : assets.avatar1}
        />
        <Block marginLeft={sizes.s} flex={1}>
          <Text p semibold>{row.full_name || "User"}</Text>
          <Text size={12} color={colors.gray} marginTop={2}>
            {formatBlockedAt(row.created_at)}
          </Text>
        </Block>
      </Block>
      <Button
        color={colors.card}
        outlined={colors.danger as string}
        shadow={false}
        paddingVertical={sizes.xs}
        paddingHorizontal={sizes.s}
        onPress={() => onUnblock(row.blocked_user_id)}
      >
        <Text p semibold color={colors.danger}>Unblock</Text>
      </Button>
    </Block>
  );

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      {/* Header */}
      <Block row flex={0} align="center" justify="space-between" paddingVertical={sizes.s} marginBottom={sizes.sm}>
        <Button onPress={() => router.back()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.link}
            source={assets.arrow}
            transform={[{ rotate: "180deg" }]}
          />
        </Button>
        <Text h5 semibold>Blocked Users</Text>
        <Block width={40} />
      </Block>

      {/* Body */}
      {loading ? (
        <Block color={colors.card} radius={sizes.cardRadius || 16} padding={sizes.m}>
          <Text p color={colors.gray}>Loading blocked users…</Text>
        </Block>
      ) : rows.length === 0 ? (
        <Block color={colors.card} radius={sizes.cardRadius || 16} padding={sizes.m}>
          <Text p semibold>No blocked users</Text>
          <Text p color={colors.gray} marginTop={sizes.xs}>
            People you block will show up here so you can review or unblock them later.
          </Text>
        </Block>
      ) : (
        <Block paddingHorizontal={sizes.md}>
          <Text size={12} color={colors.gray} marginBottom={sizes.s}>
            Blocked users can’t contact you or see your profile until you unblock them.
          </Text>
          {rows.map((row) => (
            <Row key={row.blocked_user_id} row={row} />
          ))}
        </Block>
      )}
    </Block>
  );
}
