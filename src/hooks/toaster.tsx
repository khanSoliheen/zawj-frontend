// providers/ToastProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { useData } from './useData';
import Image from '../components/image';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextProps {
  show: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextProps>({ show: () => { } });
export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useData();
  const { colors, assets, fonts } = theme;

  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [opacity] = useState(new Animated.Value(0));

  const show = (toastType: ToastType, msg: string) => {
    setType(toastType);
    setMessage(msg);

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const getBackground = () => {
    switch (type) {
      case 'success': return colors.primary;
      case 'error': return colors.danger;
      case 'info': return colors.info;
      default: return colors.card;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return assets.check;   // define in theme.assets
      case 'error': return assets.close;   // define in theme.assets
      case 'info': return assets.warning;    // define in theme.assets
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Animated.View style={[styles.toast, { backgroundColor: getBackground(), opacity }]}>
        <Image source={getIcon()} style={styles.icon} />
        <Text style={[styles.text, { color: colors.white, fontFamily: fonts?.text }]}>
          {message}
        </Text>
      </Animated.View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
  },
  text: {
    fontSize: 15,
  },
});
