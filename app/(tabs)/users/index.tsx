import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';

import { Block, Text, Input, Image } from '@/components';
import { buildUserRoute } from '@/constants/routes';
import { useData, useToast } from '@/hooks';
import UserService, { type UserCard } from '@/services/users';
import { Utils } from '@/utils/utils';

type Row = UserCard & {
  last_active_at?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const FACT_LABELS: Record<string, string> = {
  marital_status: 'Marital',
  prayer_regularity: 'Prayer',
  hijab_or_beard: 'Hijab/Beard',
  quran_level: 'Qur’an',
  children_count: 'Kids',
  employment_type: 'Employment',
  education: 'Education',
};

const kidsText = (count?: string | null) =>
  count && count !== '0'
    ? `${count} ${Number(count) === 1 ? 'child' : 'children'}`
    : count === '0'
      ? 'No children'
      : '';

const formatName = (u: Row) => {
  const first = u.gender === 'Female'
    ? (u.first_name?.charAt(0) ?? '')
    : (u.first_name ?? '');
  const last = u.last_name ?? '';
  return `${first} ${last}`.trim();
};

export default function Home() {
  const { theme } = useData();
  const { show } = useToast();
  const { colors, sizes, assets } = theme;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [from, setFrom] = useState(0);
  const [done, setDone] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingMore, setLoadingMore] = useState(false);
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
      setExpanded({});
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
      const message = error instanceof Error ? error.message : 'Failed to load users';
      show('error', message);
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [debouncedQuery, show]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPage(true, debouncedQuery);
    setRefreshing(false);
  };

  const toggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const renderCard = ({ item }: { item: Row }) => {
    const age = item.dob ? Utils.getAge(item.dob) : undefined;
    const nameLine = [formatName(item), age ? `· ${age}` : null].filter(Boolean).join(' ');

    const place = [item.city, item.state, item.country].filter(Boolean).join(', ');
    const work = item.designation || item.department || item.education || item.employment_type || '';
    const meta = [place, work].filter(Boolean).join(' • ');

    // (Optional) last active label if you later store it
    let lastActive = '';
    if (item.last_active_at) {
      const diff = Date.now() - new Date(item.last_active_at).getTime();
      if (diff < 60_000) lastActive = 'Active now';
      else if (diff < 60 * 60_000) lastActive = `${Math.round(diff / 60_000)}m ago`;
      else lastActive = 'Recently';
    }

    // Primary, compact fact line
    const primaryFacts: Array<{ label: string; value: string }> = [
      { label: FACT_LABELS.marital_status, value: item.marital_status || '' },
      { label: FACT_LABELS.prayer_regularity, value: item.prayer_regularity || '' },
      { label: FACT_LABELS.hijab_or_beard, value: item.hijab_or_beard || '' },
    ].filter(f => !!f.value);

    // More details (collapsible)
    const moreFacts: Array<{ label: string; value: string }> = [
      { label: FACT_LABELS.quran_level, value: item.quran_level || '' },
      { label: FACT_LABELS.children_count, value: kidsText(item.children_count) || '' },
      { label: FACT_LABELS.employment_type, value: item.employment_type || '' },
      { label: FACT_LABELS.education, value: item.education || '' },
    ].filter(f => !!f.value);

    const hasMoreFacts = moreFacts.length > 0;
    const primaryFactsText = primaryFacts
      .map(f => `${f.label}: ${f.value}`)
      .join('  •  ');

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(buildUserRoute(item.id))}>
        <Block
          color={colors.card}
          padding={sizes.m}
          marginBottom={sizes.sm}
          radius={sizes.radius}
          shadow
        >
          {/* Header */}
          <Block row align="center">
            <Image
              radius={12}
              width={56}
              height={56}
              source={item.avatar_url ? { uri: item.avatar_url } : assets.avatar1}
            />
            <Block marginLeft={sizes.s}>
              <Text h6 semibold>{nameLine}</Text>
              {meta ? (
                <Text size={12} color={colors.gray} marginTop={2}>{meta}</Text>
              ) : null}
            </Block>
          </Block>

          {/* Compact fact line */}
          {!!primaryFacts.length && (
            <Block marginTop={sizes.s}>
              <Block row wrap="wrap" align="center">
                <Text size={12} color={colors.gray}>
                  {primaryFactsText}
                </Text>
                {hasMoreFacts && (
                  <Text
                    size={12}
                    semibold
                    color={colors.link}
                    marginLeft={sizes.xs}
                    onPress={() => toggleExpand(item.id)}
                  >
                    {expanded[item.id] ? 'less...' : 'more...'}
                  </Text>
                )}
              </Block>
            </Block>
          )}

          {/* More details */}
          {hasMoreFacts && expanded[item.id] && (
            <Block marginTop={sizes.xs}>
              {moreFacts.map((f) => (
                <Text key={`${item.id}-${f.label}`} size={12} color={colors.gray} marginTop={4}>
                  <Text semibold size={12}>{f.label}:</Text>{` ${f.value}`}
                </Text>
              ))}
            </Block>
          )}

          {/* Last active (optional) */}
          {lastActive ? (
            <Text size={11} color={colors.gray} marginTop={sizes.xs}>
              {lastActive}
            </Text>
          ) : null}
        </Block>
      </TouchableOpacity>
    );
  };

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
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
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.l, paddingTop: sizes.s }}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!loading && !loadingMore && !done) {
            loadingMoreRef.current = true;
            setLoadingMore(true);
            fetchPage(false).finally(() => {
              loadingMoreRef.current = false;
              setLoadingMore(false);
            });
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text as string}
          />
        }
        ListEmptyComponent={
          loading
            ? <Text p center color={colors.gray}>Loading…</Text>
            : <Text p center color={colors.gray}>No profiles found</Text>
        }
      />
    </Block>
  );
}
