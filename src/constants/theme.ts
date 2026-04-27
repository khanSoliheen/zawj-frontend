import { Dimensions, Platform } from 'react-native';

import {
  ICommonTheme,
  ThemeAssets,
  ThemeFonts,
  ThemeIcons,
  ThemeLineHeights,
  ThemeWeights,
} from './types';

const { width, height } = Dimensions.get('window');

// Naming source: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight#Common_weight_name_mapping
export const WEIGHTS: ThemeWeights = {
  text: 'normal',
  h1: Platform.OS === 'ios' ? '700' : 'normal',
  h2: Platform.OS === 'ios' ? '700' : 'normal',
  h3: Platform.OS === 'ios' ? '700' : 'normal',
  h4: Platform.OS === 'ios' ? '700' : 'normal',
  h5: Platform.OS === 'ios' ? '600' : 'normal',
  p: 'normal',

  thin: Platform.OS === 'ios' ? '100' : 'normal',
  extralight: Platform.OS === 'ios' ? '200' : 'normal',
  light: Platform.OS === 'ios' ? '300' : 'normal',
  normal: Platform.OS === 'ios' ? '400' : 'normal',
  medium: Platform.OS === 'ios' ? '500' : 'normal',
  semibold: Platform.OS === 'ios' ? '600' : 'normal',
  bold: Platform.OS === 'ios' ? '700' : 'normal',
  extrabold: Platform.OS === 'ios' ? '800' : 'normal',
  black: Platform.OS === 'ios' ? '900' : 'normal',
};

export const ICONS: ThemeIcons = {
  apple: require('../../app/assets/icons/apple.png'),
  google: require('../../app/assets/icons/google.png'),
  facebook: require('../../app/assets/icons/facebook.png'),
  arrow: require('../../app/assets/icons/arrow.png'),
  articles: require('../../app/assets/icons/articles.png'),
  basket: require('../../app/assets/icons/basket.png'),
  bell: require('../../app/assets/icons/bell.png'),
  calendar: require('../../app/assets/icons/calendar.png'),
  chat: require('../../app/assets/icons/chat.png'),
  check: require('../../app/assets/icons/check.png'),
  clock: require('../../app/assets/icons/clock.png'),
  close: require('../../app/assets/icons/close.png'),
  components: require('../../app/assets/icons/components.png'),
  document: require('../../app/assets/icons/document.png'),
  documentation: require('../../app/assets/icons/documentation.png'),
  extras: require('../../app/assets/icons/extras.png'),
  flight: require('../../app/assets/icons/flight.png'),
  home: require('../../app/assets/icons/home.png'),
  hotel: require('../../app/assets/icons/hotel.png'),
  image: require('../../app/assets/icons/image.png'),
  location: require('../../app/assets/icons/location.png'),
  menu: require('../../app/assets/icons/menu.png'),
  more: require('../../app/assets/icons/more.png'),
  notification: require('../../app/assets/icons/notification.png'),
  office: require('../../app/assets/icons/office.png'),
  payment: require('../../app/assets/icons/payment.png'),
  profile: require('../../app/assets/icons/profile.png'),
  register: require('../../app/assets/icons/register.png'),
  rental: require('../../app/assets/icons/rental.png'),
  search: require('../../app/assets/icons/search.png'),
  settings: require('../../app/assets/icons/settings.png'),
  star: require('../../app/assets/icons/star.png'),
  train: require('../../app/assets/icons/train.png'),
  users: require('../../app/assets/icons/users.png'),
  warning: require('../../app/assets/icons/warning.png'),
  eye: 0,
  eyeOff: 0
};

export const ASSETS: ThemeAssets = {
  // fonts
  OpenSansLight: require('../../app/assets/fonts/OpenSans-Light.ttf'),
  OpenSansRegular: require('../../app/assets/fonts/OpenSans-Regular.ttf'),
  OpenSansSemiBold: require('../../app/assets/fonts/OpenSans-SemiBold.ttf'),
  OpenSansExtraBold: require('../../app/assets/fonts/OpenSans-ExtraBold.ttf'),
  OpenSansBold: require('../../app/assets/fonts/OpenSans-Bold.ttf'),

  // backgrounds/logo
  logo: require('../../app/assets/images/logo.png'),
  header: require('../../app/assets/images/header.png'),
  background: require('../../app/assets/images/background.png'),
  ios: require('../../app/assets/images/ios.png'),
  android: require('../../app/assets/images/android.png'),

  // cards
  card1: require('../../app/assets/images/card1.png'),
  card2: require('../../app/assets/images/card2.png'),
  card3: require('../../app/assets/images/card3.png'),
  card4: require('../../app/assets/images/card4.png'),
  card5: require('../../app/assets/images/card5.png'),

  // gallery photos
  photo1: require('../../app/assets/images/photo1.png'),
  photo2: require('../../app/assets/images/photo2.png'),
  photo3: require('../../app/assets/images/photo3.png'),
  photo4: require('../../app/assets/images/photo4.png'),
  photo5: require('../../app/assets/images/photo5.png'),
  photo6: require('../../app/assets/images/photo6.png'),
  carousel1: require('../../app/assets/images/carousel1.png'),

  // avatars
  avatar1: require('../../app/assets/images/avatar1.png'),
  avatar2: require('../../app/assets/images/avatar2.png'),
  avatarFemale: require('../../app/assets/images/female-muslim-faceless.jpg'),
  avatarMale: require('../../app/assets/images/male-muslim-faceless.png'),

  // cars
  x5: require('../../app/assets/images/x5.png'),
  gle: require('../../app/assets/images/gle.png'),
  tesla: require('../../app/assets/images/tesla.png'),
};

export const FONTS: ThemeFonts = {
  // based on font size
  text: 'OpenSans-Regular',
  h1: 'OpenSans-Bold',
  h2: 'OpenSans-Bold',
  h3: 'OpenSans-Bold',
  h4: 'OpenSans-Bold',
  h5: 'OpenSans-SemiBold',
  p: 'OpenSans-Regular',

  // based on fontWeight
  thin: 'OpenSans-Light',
  extralight: 'OpenSans-Light',
  light: 'OpenSans-Light',
  normal: 'OpenSans-Regular',
  medium: 'OpenSans-SemiBold',
  semibold: 'OpenSans-SemiBold',
  bold: 'OpenSans-Bold',
  extrabold: 'OpenSans-ExtraBold',
  black: 'OpenSans-ExtraBold',
};

export const LINE_HEIGHTS: ThemeLineHeights = {
  // font lineHeight
  text: 22,
  h1: 60,
  h2: 55,
  h3: 43,
  h4: 33,
  h5: 24,
  p: 22,
};

export const THEME: ICommonTheme = {
  icons: ICONS,
  assets: { ...ICONS, ...ASSETS },
  fonts: FONTS,
  weights: WEIGHTS,
  lines: LINE_HEIGHTS,
  sizes: { width, height },
};
