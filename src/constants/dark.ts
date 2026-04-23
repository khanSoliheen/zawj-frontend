import { SIZES, SPACING } from './light';
import { THEME as commonTheme } from './theme';
import { ITheme, ThemeColors, ThemeGradients } from './types';

export const DARK_COLORS: ThemeColors = {
  text: '#FFFFFF',

  primary: '#FF0080',
  secondary: '#A8B8D8',
  tertiary: '#E8AE4C',

  black: '#000000',
  white: '#1A1A1A',

  dark: '#111827',
  light: '#374151',

  gray: '#9CA3AF',

  danger: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
  info: '#60A5FA',

  card: '#1F2937',
  background: '#111827',

  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',

  focus: '#FF66B2',
  input: '#E5E7EB',

  switchOn: '#6B7280',
  switchOff: '#374151',

  checkbox: ['#6B7280', '#111827'],
  checkboxIcon: '#FFFFFF',

  facebook: '#3B5998',
  twitter: '#55ACEE',
  dribbble: '#EA4C89',

  icon: '#9CA3AF',

  blurTint: 'dark',

  link: '#FF66B2',
};

export const DARK_GRADIENTS: ThemeGradients = {
  primary: ['#FF0080', '#7928CA'],
  secondary: ['#64748B', '#334155'],
  info: ['#60A5FA', '#2563EB'],
  success: ['#34D399', '#059669'],
  warning: ['#FBBF24', '#B45309'],
  danger: ['#F87171', '#B91C1C'],

  light: ['#4B5563', '#374151'],
  dark: ['#111827', '#000000'],

  white: [String(DARK_COLORS.white), '#1F2937'],
  black: [String(DARK_COLORS.black), '#000000'],

  divider: ['rgba(255,255,255,0.2)', 'rgba(0,0,0,0.4)'],
  menu: [
    'rgba(0,0,0,0.4)',
    'rgba(55,65,81,0.6)',
    'rgba(0,0,0,0.4)',
  ],
};

export const DARK_THEME: ITheme = {
  ...commonTheme,
  colors: DARK_COLORS,
  gradients: DARK_GRADIENTS,
  sizes: { ...SIZES, ...commonTheme.sizes, ...SPACING }, // reuse spacing/sizes
};
