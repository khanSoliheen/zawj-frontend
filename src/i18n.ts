import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '@/constants/translations/ar.json';
import en from '@/constants/translations/en.json';
import ur from '@/constants/translations/ur.json';

export const APP_LANGUAGE_KEY = '@app_language';
export const SUPPORTED_LANGUAGES = ['en', 'ar', 'ur'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const normalizeLanguage = (value?: string | null): AppLanguage => {
  if (value && SUPPORTED_LANGUAGES.includes(value as AppLanguage)) {
    return value as AppLanguage;
  }

  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage as AppLanguage)) {
    return deviceLanguage as AppLanguage;
  }

  return 'en';
};

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  lng: 'en',
  resources: {
    ar: {
      translation: ar,
    },
    en: {
      translation: en,
    },
    ur: {
      translation: ur,
    },
  },
});

export const hydrateAppLanguage = async () => {
  const storedLanguage = await AsyncStorage.getItem(APP_LANGUAGE_KEY);
  const nextLanguage = normalizeLanguage(storedLanguage);

  if (i18n.resolvedLanguage !== nextLanguage) {
    await i18n.changeLanguage(nextLanguage);
  }
};

export const setAppLanguage = async (language: AppLanguage) => {
  const nextLanguage = normalizeLanguage(language);
  await i18n.changeLanguage(nextLanguage);
  await AsyncStorage.setItem(APP_LANGUAGE_KEY, nextLanguage);
};

export const getCurrentLanguage = (): AppLanguage =>
  normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);

void hydrateAppLanguage();

export default i18n;
