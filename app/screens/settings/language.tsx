import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Block, Button, Image, Text } from '@/components';
import { useData, useToast } from '@/hooks';
import { getCurrentLanguage, setAppLanguage, type AppLanguage } from '@/i18n';

const LANGUAGE_OPTIONS: AppLanguage[] = ['en', 'ar', 'ur'];

export default function LanguageSettings() {
  const { theme } = useData();
  const { show } = useToast();
  const { t, i18n } = useTranslation();
  const { colors, sizes, assets } = theme;
  const currentLanguage = getCurrentLanguage();

  const getLanguageLabel = (language: AppLanguage) => {
    switch (language) {
      case 'ar':
        return t('language.arabic');
      case 'ur':
        return t('language.urdu');
      default:
        return t('language.english');
    }
  };

  const handleLanguageChange = async (language: AppLanguage) => {
    if (language === currentLanguage) {
      return;
    }

    await setAppLanguage(language);
    show('success', i18n.t('language.updated'));
  };

  return (
    <Block safe flex={1} color={colors.background} paddingHorizontal={sizes.padding}>
      <Block row flex={0} align="center" justify="space-between" paddingVertical={sizes.s} marginBottom={sizes.sm}>
        <Button onPress={() => router.back()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.link}
            source={assets.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
        <Text h5 semibold>{t('language.title')}</Text>
        <Block width={40} />
      </Block>

      <Block scroll paddingHorizontal={sizes.md} contentContainerStyle={{ paddingBottom: sizes.xl }}>
        <Text p color={colors.gray}>
          {t('language.description')}
        </Text>

        <Block
          marginTop={sizes.m}
          padding={sizes.m}
          radius={sizes.cardRadius}
          color={colors.card}
          style={{
            borderColor: colors.secondary,
            borderWidth: 1,
          }}
        >
          {LANGUAGE_OPTIONS.map((language, index) => {
            const isSelected = currentLanguage === language;

            return (
              <Button
                key={language}
                row
                justify="space-between"
                align="center"
                paddingVertical={sizes.sm}
                onPress={() => handleLanguageChange(language)}
                style={{
                  borderBottomColor: colors.secondary,
                  borderBottomWidth: index === LANGUAGE_OPTIONS.length - 1 ? 0 : 1,
                }}
              >
                <Text p semibold={isSelected}>
                  {getLanguageLabel(language)}
                </Text>
                {isSelected ? (
                  <Text p semibold color={colors.link}>
                    {t('language.selected')}
                  </Text>
                ) : (
                  <Block />
                )}
              </Button>
            );
          })}
        </Block>

        <Block marginTop={sizes.m}>
          <Text size={12} color={colors.gray}>
            {t('language.coverage_note')}
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
