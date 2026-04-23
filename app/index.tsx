// app/welcome.tsx
import { Link } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

import { ROUTES } from '@/constants/routes';

import logo from './assets/images/carousel1.png';

// import { useTheme } from './theme/useTheme';

export default function Welcome() {
  // const theme = useTheme();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView | null>(null);

  const scrollToHowItWorks = () => {
    scrollRef.current?.scrollTo({ y: 320, animated: true });
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image
        style={styles.tinyLogo}
        source={logo}
      />
      {/* Tagline */}
      <Text style={styles.tagline}>{t('find_your_life_partner')}</Text>

      {/* Get Started Button */}
      <Link href={ROUTES.LOGIN} asChild>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.outlineButtonText}>{t('button.get_started')}</Text>
        </TouchableOpacity>
      </Link>

      {/* How It Works */}
      <Text style={styles.sectionTitle}>{t('how_it_works')}</Text>
      <View style={styles.stepList}>
        <Text style={styles.stepItem}>1. Create a profile</Text>
        <Text style={styles.stepItem}>2. Browse profiles</Text>
        <Text style={styles.stepItem}>3. Connect with matches</Text>
      </View>

      {/* Learn More */}
      <TouchableOpacity style={[styles.primaryButton, styles.learnMoreButton]} onPress={scrollToHowItWorks}>
        <Text style={styles.outlineButtonText}>{t('button.learn_more')}</Text>
      </TouchableOpacity>
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 18,
    marginBottom: 24,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    borderRadius: 16,
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 50,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    margin: 20,
    fontWeight: '600',
    alignItems: 'flex-start',
  },
  stepList: {
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  stepItem: {
    fontSize: 16,
    marginVertical: 4,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  learnMoreButton: {
    borderWidth: 2,
    borderRadius: 24,
  },
  tinyLogo: {
    width: 300,
    height: 220,
  },
});
