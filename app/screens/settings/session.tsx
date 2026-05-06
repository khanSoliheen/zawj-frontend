import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Block, Button, Text, Image } from "@/components";
import { ROUTES } from '@/constants/routes';
import { useAuth, useData, useToast } from "@/hooks";
import SessionService from '@/services/session';
import SettingsService from "@/services/settings";

type SessInfo = {
  userEmail?: string | null;
  createdAt?: string | null;
  lastSeenAt?: string | null;
  expiresAt?: string | null;
};

type SessionItem = {
  id: string;
  title: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export default function SessionsSettings() {
  const { logout } = useAuth();
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [info, setInfo] = useState<SessInfo>({});
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [working, setWorking] = useState<"others" | "all" | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await SettingsService.getSessionInfo();
        const rows = await SettingsService.getSessions();
        setInfo({
          userEmail: session.user_email,
          createdAt: new Date(session.created_at).toLocaleString(),
          lastSeenAt: new Date(session.last_seen_at).toLocaleString(),
          expiresAt: new Date(session.expires_at).toLocaleString(),
        });
        setSessions(rows.map((row) => ({
          id: row.id,
          title: row.user_agent?.trim() || 'Unknown device',
          createdAt: new Date(row.created_at).toLocaleString(),
          lastSeenAt: new Date(row.last_seen_at).toLocaleString(),
          expiresAt: new Date(row.expires_at).toLocaleString(),
          isCurrent: row.is_current,
        })));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load session info";
        show("error", message);
      }
    })();
  }, [show]);

  const signOutOthers = async () => {
    setWorking("others");
    try {
      await SessionService.signOut('others');
      show("success", "Signed out of other devices");
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sign out of other devices';
      show("error", message);
    } finally {
      setWorking(null);
    }
  };

  const signOutAll = async () => {
    setWorking("all");
    try {
      await logout('global');
      show("success", "Signed out everywhere");
      router.replace(ROUTES.LOGIN);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sign out everywhere';
      show("error", message);
    } finally {
      setWorking(null);
    }
  };

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <Block paddingVertical={sizes.xs}>
      <Text size={12} color={colors.gray}>{label}</Text>
      <Text p semibold>{value || "—"}</Text>
    </Block>
  );

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await SettingsService.revokeSession(sessionId);
      setSessions((current) => current.filter((session) => session.id !== sessionId));
      show("success", "Session removed");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove session';
      show("error", message);
    } finally {
      setRevokingId(null);
    }
  };

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
        <Text h5 semibold>Devices & Sessions</Text>
        <Block width={40} />
      </Block>

      <Block scroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: sizes.xl }}>
        {/* Current session info */}
        <Block
          color={colors.card}
          radius={sizes.cardRadius || 16}
          padding={sizes.m}
          shadow
          marginBottom={sizes.m}
        >
          <Row label="Signed in as" value={info.userEmail} />
          <Row label="Session created" value={info.createdAt} />
          <Row label="Last active" value={info.lastSeenAt} />
          <Row label="Session expires" value={info.expiresAt} />
        </Block>

        <Block>
          <Text h6 semibold>Active devices</Text>
          <Text size={12} color={colors.gray} marginTop={sizes.xs} marginBottom={sizes.s}>
            Review where your account is signed in and remove sessions you no longer trust.
          </Text>

          {sessions.map((session) => (
            <Block
              key={session.id}
              color={colors.card}
              radius={sizes.cardRadius || 16}
              padding={sizes.m}
              marginBottom={sizes.s}
              shadow
            >
              <Block row justify="space-between" align="flex-start">
                <Block flex={1} marginRight={sizes.s}>
                  <Text p semibold>{session.title}</Text>
                  <Text size={12} color={colors.gray} marginTop={2}>
                    Last active: {session.lastSeenAt}
                  </Text>
                </Block>

                {session.isCurrent ? (
                  <Block
                    flex={0}
                    paddingHorizontal={sizes.s}
                    paddingVertical={4}
                    radius={12}
                    color={colors.primary}
                  >
                    <Text size={11} color={colors.white} semibold>This device</Text>
                  </Block>
                ) : (
                  <Button
                    flex={0}
                    onPress={() => void revokeSession(session.id)}
                    disabled={working !== null || revokingId !== null}
                    outlined={colors.danger as string}
                  >
                    <Text p semibold color={colors.danger}>
                      {revokingId === session.id ? 'Removing…' : 'Delete'}
                    </Text>
                  </Button>
                )}
              </Block>
              <Block row wrap="wrap" marginTop={sizes.s}>
                <Text size={12} color={colors.gray} marginRight={sizes.s}>
                  Signed in: {session.createdAt}
                </Text>
                <Text size={12} color={colors.gray}>
                  Expires: {session.expiresAt}
                </Text>
              </Block>
            </Block>
          ))}
        </Block>

        <Block marginTop={sizes.m}>
          <Button onPress={signOutOthers} disabled={working !== null} marginBottom={sizes.s}>
            <Text p semibold color={colors.link}>
              {working === "others" ? "Signing out…" : "Sign out of other devices"}
            </Text>
          </Button>

          <Button onPress={signOutAll} disabled={working !== null}>
            <Text p semibold color={colors.danger}>
              {working === "all" ? "Signing out…" : "Sign out of all devices"}
            </Text>
          </Button>

          <Text size={12} color={colors.gray} marginTop={sizes.s}>
            Use this if you lost a phone or signed in on a shared device.
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
