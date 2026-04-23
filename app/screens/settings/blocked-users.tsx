import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Block, Button, Text, Image } from "@/components";
import { useData, useToast } from "@/hooks";
import SettingsService, { type BlockedUserRow } from "@/services/settings";

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
        const message = error instanceof Error ? error.message : "Failed to load blocked users";
        show("error", message);
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
      const message = e instanceof Error ? e.message : 'Failed to unblock';
      show("error", message);
    }
  };

  const Row = ({ row }: { row: BlockedUserRow }) => (
    <Block row align="center" justify="space-between" paddingVertical={sizes.sm}>
      <Block row align="center">
        <Image
          radius={8}
          width={36}
          height={36}
          source={row.avatar_url ? { uri: row.avatar_url } : assets.avatar1}
        />
        <Block marginLeft={sizes.s}>
          <Text p semibold>{row.full_name || "User"}</Text>
        </Block>
      </Block>
      <Button onPress={() => onUnblock(row.blocked_user_id)}>
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
        <Text p color={colors.gray}>Loading…</Text>
      ) : rows.length === 0 ? (
        <Text p color={colors.gray}>You haven’t blocked anyone.</Text>
      ) : (
        <Block paddingHorizontal={sizes.md}>
          {rows.map((row) => (
            <Row key={row.blocked_user_id} row={row} />
          ))}
        </Block>
      )}
    </Block>
  );
}
