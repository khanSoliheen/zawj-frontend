/* global jest, describe, it, expect, beforeEach, afterEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import UsersScreen from '@/(tabs)/users';
import { buildUserRoute } from '@/constants/routes';

const mockShow = jest.fn();
const mockGetUsers = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    card: '#f5f5f5',
    gray: '#808080',
    link: '#0a84ff',
    text: '#111111',
  },
  sizes: {
    padding: 16,
    s: 8,
    xs: 4,
    sm: 12,
    m: 16,
    l: 24,
    radius: 12,
  },
  assets: {
    avatar1: 1,
  },
};

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
}));

jest.mock('@/services/users', () => ({
  __esModule: true,
  default: {
    getUsers: (...args: unknown[]) => mockGetUsers(...args),
  },
}));

jest.mock('react-native', () => {
  const React = require('react');

  return {
    FlatList: ({
      data,
      renderItem,
      ListEmptyComponent,
      ...props
    }: Record<string, unknown> & {
      data?: unknown[];
      renderItem?: (params: { item: unknown; index: number }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode;
    }) => {
      const children = Array.isArray(data) && data.length > 0
        ? data.map((item, index) => React.createElement(React.Fragment, { key: index }, renderItem?.({ item, index })))
        : ListEmptyComponent ?? null;

      return React.createElement('MockFlatList', props, children);
    },
    RefreshControl: (props: Record<string, unknown>) => React.createElement('MockRefreshControl', props),
    TouchableOpacity: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockTouchableOpacity', props, children),
  };
});

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };

  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
  };
});

describe('Users screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUsers.mockResolvedValue([
      {
        id: 'user-2',
        first_name: 'Fatima',
        last_name: 'Ali',
        gender: 'Female',
        dob: '1998-01-01',
        city: 'Doha',
        state: 'Doha',
        country: 'Qatar',
        designation: 'Engineer',
        marital_status: 'Single',
        prayer_regularity: 'Regularly',
        hijab_or_beard: 'Yes',
        quran_level: 'Intermediate',
        children_count: '0',
        employment_type: 'Private',
        education: 'BSc',
        department: 'Engineering',
      },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads profile cards, expands details, and navigates to a profile', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<UsersScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetUsers).toHaveBeenCalledWith({
      from: 0,
      limit: 20,
      q: '',
    });

    const moreToggle = renderer!.root.findAll(
      (node) => String(node.type) === 'MockText' && node.children.join('') === 'more...',
    )[0];

    act(() => {
      moreToggle?.props.onPress();
    });

    expect(
      renderer!.root.findAll(
        (node) => String(node.type) === 'MockText' && node.children.join('').includes('Education:'),
      ).length,
    ).toBeGreaterThan(0);

    const pressable = renderer!.root.find((node) => String(node.type) === 'MockTouchableOpacity');

    act(() => {
      pressable.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith(buildUserRoute('user-2'));
    act(() => {
      renderer!.unmount();
    });
  });

  it('debounces search and queries with the latest text only', async () => {
    jest.useFakeTimers();
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<UsersScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    const input = renderer!.root.findAll((node) => String(node.type) === 'MockInput')[0];

    act(() => {
      input.props.onChangeText('fa');
      input.props.onChangeText('fat');
      input.props.onChangeText('fatima');
    });

    expect(mockGetUsers).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(mockGetUsers).toHaveBeenCalledTimes(2);
    expect(mockGetUsers).toHaveBeenLastCalledWith({
      from: 0,
      limit: 20,
      q: 'fatima',
    });

    act(() => {
      jest.runOnlyPendingTimers();
      renderer!.unmount();
    });
  });

  it('ignores stale search responses and keeps the latest query results', async () => {
    jest.useFakeTimers();
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    let firstSearchResolve: ((value: unknown) => void) | undefined;
    let secondSearchResolve: ((value: unknown) => void) | undefined;

    mockGetUsers.mockImplementation(({ q }: { q?: string }) => {
      if (!q) {
        return Promise.resolve([]);
      }

      if (q === 'fat') {
        return new Promise((resolve) => {
          firstSearchResolve = resolve;
        });
      }

      if (q === 'fatima') {
        return new Promise((resolve) => {
          secondSearchResolve = resolve;
        });
      }

      return Promise.resolve([]);
    });

    await act(async () => {
      renderer = TestRenderer.create(<UsersScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    const input = renderer!.root.findAll((node) => String(node.type) === 'MockInput')[0];

    act(() => {
      input.props.onChangeText('fat');
    });

    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    act(() => {
      input.props.onChangeText('fatima');
    });

    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    await act(async () => {
      secondSearchResolve?.([
        {
          id: 'latest-user',
          first_name: 'Fatima',
          last_name: 'Latest',
          gender: 'Female',
          dob: '1998-01-01',
          city: 'Doha',
          state: 'Doha',
          country: 'Qatar',
          designation: 'Engineer',
          marital_status: 'Single',
          prayer_regularity: 'Regularly',
          hijab_or_beard: 'Yes',
          quran_level: 'Intermediate',
          children_count: '0',
          employment_type: 'Private',
          education: 'BSc',
          department: 'Engineering',
        },
      ]);
      await Promise.resolve();
    });

    await act(async () => {
      firstSearchResolve?.([
        {
          id: 'stale-user',
          first_name: 'Fatima',
          last_name: 'Stale',
          gender: 'Female',
          dob: '1998-01-01',
          city: 'Doha',
          state: 'Doha',
          country: 'Qatar',
          designation: 'Engineer',
          marital_status: 'Single',
          prayer_regularity: 'Regularly',
          hijab_or_beard: 'Yes',
          quran_level: 'Intermediate',
          children_count: '0',
          employment_type: 'Private',
          education: 'BSc',
          department: 'Engineering',
        },
      ]);
      await Promise.resolve();
    });

    const textNodes = renderer!.root.findAll((node) => String(node.type) === 'MockText');
    const textContent = textNodes.map((node) => node.children.join(' ')).join(' | ');

    expect(textContent).toContain('Latest');
    expect(textContent).not.toContain('Stale');

    act(() => {
      jest.runOnlyPendingTimers();
      renderer!.unmount();
    });
  });
});
