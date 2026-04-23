import Storage from '@react-native-async-storage/async-storage';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ITheme, IUseData } from '@/constants/types';

import { light, dark } from '../constants';

export const DataContext = React.createContext({
  isDark: false, handleIsDark: () => { }, theme: light, setTheme: () => { },
} as IUseData);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState<ITheme>(light);

  // get isDark mode from storage
  const getIsDark = useCallback(async () => {
    try {
      const isDarkJSON = await Storage.getItem('isDark');
      if (isDarkJSON !== null) {
        setIsDark(JSON.parse(isDarkJSON));
      }
    } catch (e) {
      console.warn("Error reading isDark from storage", e);
    }
  }, []);

  // handle isDark mode toggle
  const handleIsDark = useCallback((payload: boolean) => {
    setIsDark(payload);
    Storage.setItem('isDark', JSON.stringify(payload));
  }, []);

  // change theme based on isDark updates
  useEffect(() => {
    setTheme(isDark ? dark : light);
  }, [isDark]);

  // load preference on mount
  useEffect(() => {
    getIsDark();
  }, [getIsDark]);

  const contextValue = useMemo<IUseData>(() => ({
    isDark,
    handleIsDark,
    theme,
    setTheme,
  }), [handleIsDark, isDark, theme, setTheme]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext) as IUseData;
