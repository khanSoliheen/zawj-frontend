/* global jest, describe, it, expect, beforeEach */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { dark } from '@/constants';
import { DataProvider, useData } from '@/hooks/useData';

type DataSnapshot = ReturnType<typeof useData>;

let latestData: DataSnapshot | null = null;

const Probe = () => {
  latestData = useData();
  return null;
};

describe('DataProvider', () => {
  beforeEach(async () => {
    latestData = null;
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('hydrates dark mode from storage on mount', async () => {
    await AsyncStorage.setItem('isDark', JSON.stringify(true));

    await act(async () => {
      TestRenderer.create(
        <DataProvider>
          <Probe />
        </DataProvider>,
      );
    });

    expect(latestData?.isDark).toBe(true);
    expect(latestData?.theme.colors.background).toBe(dark.colors.background);
  });

  it('persists dark mode changes through handleIsDark', async () => {
    await act(async () => {
      TestRenderer.create(
        <DataProvider>
          <Probe />
        </DataProvider>,
      );
    });

    act(() => {
      latestData?.handleIsDark(true);
    });

    expect(latestData?.isDark).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('isDark', 'true');
  });
});
