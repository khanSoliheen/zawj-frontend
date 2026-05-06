import Constants from 'expo-constants';
import { Platform } from 'react-native';

import SettingsService from '@/services/settings';

const getProjectId = () => {
  const extraProjectId =
    Constants.expoConfig?.extra?.eas?.projectId
    || Constants.easConfig?.projectId
    || process.env.EXPO_PUBLIC_EXPO_PROJECT_ID;

  return typeof extraProjectId === 'string' && extraProjectId.trim().length > 0
    ? extraProjectId.trim()
    : null;
};

const getDeviceName = () => {
  const modelName = Constants.platform?.ios?.model || Constants.platform?.android?.model;
  if (typeof modelName === 'string' && modelName.trim().length > 0) {
    return modelName.trim();
  }
  return Platform.OS;
};

export const registerDeviceForPush = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    return null;
  }

  const Notifications = await import('expo-notifications');
  const Device = await import('expo-device');

  if (!Device.isDevice) {
    return null;
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = pushToken.data?.trim();

  if (!token) {
    return null;
  }

  await SettingsService.registerPushToken({
    token,
    platform: Platform.OS,
    device_name: getDeviceName(),
  });

  return token;
};

export const unregisterDevicePushToken = async (token: string | null | undefined) => {
  if (!token) {
    return;
  }

  await SettingsService.deletePushToken(token);
};
