export const ROUTES = {
  WELCOME: '/',
  LOGIN: '/login',
  REGISTER_STEP_1: '/register/step1',
  REGISTER_STEP_2: '/register/step2',
  REGISTER_STEP_3: '/register/step3',
  REGISTER_STEP_4: '/register/step4',
  REGISTER_STEP_5: '/register/step5',
  USERS: '/users',
  CHAT: '/chat',
  PREFERENCES: '/preferences',
  PROFILE: '/profile',
  SETTINGS: '/screens/settings',
  SETTINGS_EDIT: '/screens/settings/edit',
  SETTINGS_CHANGE_PASSWORD: '/screens/settings/change-password',
  SETTINGS_CONTACT: '/screens/settings/contact',
  SETTINGS_LANGUAGE: '/screens/settings/language',
  SETTINGS_NOTIFICATIONS: '/screens/settings/notifications',
  SETTINGS_POLICY: '/screens/settings/policy',
  SETTINGS_ABOUT: '/screens/settings/about',
  SETTINGS_FAQ: '/screens/settings/faq',
  SETTINGS_REPORT: '/screens/settings/report',
  SETTINGS_SESSION: '/screens/settings/session',
  SETTINGS_TWO_FACTOR: '/screens/settings/twofa',
  SETTINGS_USER_BLOCK: '/screens/settings/user-block',
  SETTINGS_BLOCKED_USERS: '/screens/settings/blocked-users',
  SETTINGS_VERIFICATION: '/screens/settings/verification',
  SETTINGS_VISIBILITY: '/screens/settings/visibility',
  SETTINGS_PHOTO_REQUESTS: '/screens/settings/photo-requests',
  SETTINGS_DELETE_ACCOUNT: '/screens/settings/delete-account',
  NOTIFICATIONS_CENTER: '/screens/notifications-center',
  SUPPORT: '/screens/support',
} as const;

export const PROTECTED_SEGMENTS = new Set(['(tabs)', 'screens', 'support']);

export const buildUserRoute = (userId: string) => `${ROUTES.USERS}/${userId}` as const;

export const buildChatRoute = (chatId: string) => `${ROUTES.CHAT}/${chatId}` as const;
