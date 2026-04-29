import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';

import { Block, Image, Input, NotificationBellButton, Text } from '@/components';
import { ROUTES, buildChatRoute, buildUserRoute } from '@/constants/routes';
import { useAuth, useData, useRealtime, useToast } from '@/hooks';
import UserService, { type UserCard } from '@/services/users';
import { getUserAvatarSource } from '@/utils/avatar';
import { toUserMessage } from '@/utils/errors';
import { Utils } from '@/utils/utils';

type Row = UserCard;

const FACT_LABELS: Record<string, string> = {
  marital_status: 'Marital',
  prayer_regularity: 'Prayer',
  hijab_or_beard: 'Hijab/Beard',
};

const formatName = (user: Row) => {
  const first = user.gender === 'Female'
    ? (user.first_name?.charAt(0) ?? '')
    : (user.first_name ?? '');
  return `${first} ${user.last_name ?? ''}`.trim();
};

const buildSecondaryLine = (user: Row) => {
  const job = user.designation?.trim() || user.employment_type?.trim() || user.department?.trim();
  const location = [user.city, user.state].map((value) => value?.trim()).filter(Boolean).join(', ');
  return [job, location].filter(Boolean).join(' • ');
};

export default function Home() {
  const { theme } = useData();
  const { show } = useToast();
  const { billingStatus } = useAuth();
  const { lastEvent, eventTick } = useRealtime();
  const { colors, sizes, assets } = theme;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [from, setFrom] = useState(0);
  const [done, setDone] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyInterestId, setBusyInterestId] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const fromRef = useRef(0);
  const doneRef = useRef(false);
  const queryRef = useRef('');
  const loadingRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const PAGE = 20;

  const fetchPage = useCallback(async (reset = false, nextQuery = debouncedQuery) => {
    const normalizedQuery = nextQuery.trim();

    if (!reset && (doneRef.current || loadingRef.current || loadingMoreRef.current)) {
      return;
    }

    const start = reset ? 0 : fromRef.current;
    const requestId = ++requestIdRef.current;

    if (reset) {
      queryRef.current = normalizedQuery;
      doneRef.current = false;
      fromRef.current = 0;
      loadingMoreRef.current = false;
      setLoading(start === 0);
      setDone(false);
      setFrom(0);
    }

    try {
      const page = await UserService.getUsers({
        from: start,
        limit: PAGE,
        q: normalizedQuery,
      });

      if (requestId !== requestIdRef.current || normalizedQuery !== queryRef.current) {
        return;
      }

      setRows((prev) => {
        if (reset) {
          return page;
        }

        const seen = new Set(prev.map((row) => row.id));
        return [...prev, ...page.filter((row) => !seen.has(row.id))];
      });
      doneRef.current = page.length < PAGE;
      fromRef.current = start + page.length;
      setDone(page.length < PAGE);
      setFrom(start + page.length);
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to load users'));
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [debouncedQuery, show]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery === debouncedQuery) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
    }, 250);

    return () => clearTimeout(timeout);
  }, [debouncedQuery, query]);

  useEffect(() => {
    queryRef.current = debouncedQuery;
    void fetchPage(true, debouncedQuery);
  }, [debouncedQuery, fetchPage]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    fromRef.current = from;
  }, [from]);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  useEffect(() => {
    if (!lastEvent) {
      return;
    }

    if (lastEvent.type === 'presence_updated') {
      setRows((current) => current.map((row) => (
        row.id === lastEvent.user_id
          ? { ...row, is_online: lastEvent.is_online }
          : row
      )));
      return;
    }

    if (lastEvent.type === 'connection_updated' || lastEvent.type === 'notification_updated') {
      void fetchPage(true, debouncedQuery);
    }
  }, [debouncedQuery, eventTick, fetchPage, lastEvent]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPage(true, debouncedQuery);
    setRefreshing(false);
  };

  const handleQuickMessage = (item: Row) => {
    if (!billingStatus || !['active', 'grace'].includes(billingStatus.access_state)) {
      show('info', 'Premium is required to send a new message request.');
      router.push(ROUTES.SETTINGS_BILLING);
      return;
    }

    router.push({
      pathname: buildChatRoute('new'),
      params: {
        name: `${item.first_name} ${item.last_name}`.trim(),
        peerId: item.id,
        peerAvatarUrl: item.avatar_url ?? '',
      },
    });
  };

  const handleToggleInterest = async (item: Row) => {
    if (busyInterestId) {
      return;
    }

    setBusyInterestId(item.id);
    try {
      const response = item.interested
        ? await UserService.removeInterest(item.id)
        : await UserService.expressInterest(item.id);

      setRows((current) => current.map((row) => (
        row.id === item.id
          ? { ...row, interested: response.interested }
          : row
      )));
    } catch (error) {
      show('error', toUserMessage(error, 'Failed to update interest'));
    } finally {
      setBusyInterestId(null);
    }
  };

  const renderItem = ({ item }: { item: Row }) => {
    const age = item.dob ? Utils.getAge(item.dob) : undefined;
    const nameLine = [formatName(item), age ? `${age}` : null].filter(Boolean).join(', ');
    const detailLine = buildSecondaryLine(item);
    const facts = [
      { label: FACT_LABELS.marital_status, value: item.marital_status },
      { label: FACT_LABELS.prayer_regularity, value: item.prayer_regularity },
      { label: FACT_LABELS.hijab_or_beard, value: item.hijab_or_beard },
    ].filter((fact) => fact.value && fact.value.trim().length > 0);

    return (
      <Block
        row
        align="center"
        justify="space-between"
        paddingVertical={sizes.m}
        paddingHorizontal={sizes.s}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: String(colors.card),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(buildUserRoute(item.id))}
          style={{ flex: 1 }}
        >
          <Block row align="center">
            <Block flex={0} marginRight={sizes.m}>
              <Image
                radius={30}
                width={60}
                height={60}
                source={getUserAvatarSource({
                  assets,
                  avatarUrl: item.avatar_url,
                  gender: item.gender,
                })}
              />
              <Block
                flex={0}
                width={14}
                height={14}
                radius={7}
                color={item.is_online ? colors.success : colors.gray}
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  borderWidth: 2,
                  borderColor: String(colors.background),
                }}
              />
            </Block>

            <Block flex={1}>
              {/*<Block row align="center" marginBottom={sizes.xs}>
                <Block
                  flex={0}
                  width={8}
                  height={8}
                  radius={4}
                  color={item.is_online ? colors.success : colors.gray}
                  marginRight={sizes.xs}
                />
                <Text size={12} color={item.is_online ? colors.success : colors.gray} semibold>
                  {item.is_online ? 'Online' : 'Offline'}
                </Text>
              </Block>*/}

              <Text h6 semibold>{nameLine}</Text>
              {detailLine ? (
                <Text size={12} color={colors.gray} marginTop={2}>
                  {detailLine}
                </Text>
              ) : null}

              <Block row wrap="wrap" marginTop={sizes.xs}>
                {facts.map((fact, index) => (
                  <Text
                    key={`${item.id}-${fact.label}`}
                    size={12}
                    color={colors.gray}
                    marginRight={index < facts.length - 1 ? sizes.s : 0}
                    marginTop={2}
                  >
                    <Text semibold size={12}>{fact.label}:</Text>{` ${fact.value}`}
                  </Text>
                ))}
              </Block>
            </Block>
          </Block>
        </TouchableOpacity>

        <Block flex={0} align="center" marginLeft={sizes.m}>
          <TouchableOpacity
            accessibilityLabel={`Message ${item.first_name}`}
            activeOpacity={0.8}
            onPress={() => handleQuickMessage(item)}
            style={{ marginBottom: sizes.s }}
          >
            <Block
              flex={0}
              width={40}
              height={40}
              radius={20}
              color={colors.card}
              align="center"
              justify="center"
            >
              <Image source={assets.chat} width={18} height={18} color={colors.text} radius={0} />
            </Block>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel={item.interested ? `Remove interest for ${item.first_name}` : `Express interest in ${item.first_name}`}
            activeOpacity={0.8}
            onPress={() => void handleToggleInterest(item)}
            disabled={busyInterestId === item.id}
          >
            <Block
              flex={0}
              width={40}
              height={40}
              radius={20}
              color={item.interested ? colors.primary : colors.card}
              align="center"
              justify="center"
            >
              <Image
                source={assets.star}
                width={18}
                height={18}
                color={item.interested ? colors.white : colors.text}
                radius={0}
              />
            </Block>
          </TouchableOpacity>
        </Block>
      </Block>
    );
  };

  return (
    <Block flex={1} color={colors.background}>
      <Block flex={1} paddingHorizontal={sizes.padding}>
        <Block row flex={0} align="center" justify="space-between" paddingTop={sizes.s} paddingBottom={sizes.s}>
          <Image
            source={assets.logo}
            width={60}
            height={80}
            resizeMode="contain"
            radius={0}
            color={colors.text}
          />
          <NotificationBellButton />
        </Block>

        <Input
          search
          placeholder="Search profiles…"
          marginBottom={sizes.s}
          value={query}
          onChangeText={setQuery}
        />

        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={String(colors.primary)} />
          }
          contentContainerStyle={{
            paddingBottom: sizes.xl,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (loadingMore || loading || done) {
              return;
            }
            setLoadingMore(true);
            void fetchPage(false, debouncedQuery).finally(() => setLoadingMore(false));
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={!loading ? (
            <Block paddingVertical={sizes.xl} align="center">
              <Text p color={colors.gray}>No profiles found.</Text>
            </Block>
          ) : null}
        />
      </Block>
    </Block>
  );
}
