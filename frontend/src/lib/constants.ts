export const STORAGE_KEYS = {
  USER: 'contador_user',
  THEME: 'contador_theme',
  LOCALE: 'contador_locale',
  VIEW_MODE: 'contador_view_mode',
  MOCK_USERS: 'contador_mock_users',
  counters: (uid: string) => `contador_counters_${uid}`,
  history: (uid: string) => `contador_history_${uid}`,
} as const;

export const APP_LIMITS = {
  MIN_INCREMENT_BUTTONS: 1,
  MAX_INCREMENT_BUTTONS: 3,
  MAX_DECIMAL_PRECISION: 3, // 0 to 3 decimals
  CARD_HISTORY_LIMIT: 5,
  FIRESTORE_HISTORY_LIMIT: 50,
  HISTORY_MODAL_PAGE_SIZE: 10,
} as const;

export const TIMING = {
  VALUE_POP_ANIMATION_MS: 180,
  SPLASH_DURATION_MS: 3000,
} as const;

export const AUTH_CONFIG = {
  MOCK_USER_DOMAIN: 'contador.local',
  LOCAL_USER_PREFIX: 'local-',
  LOCAL_ANON_PREFIX: 'local-anon-',
} as const;
