/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_BUILD_UID: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG_PANEL: string
  readonly VITE_ENABLE_CSRF: string
  readonly VITE_TOKEN_STORAGE_KEY: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_ENABLE_ANIMATIONS: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_ADMIN_SESSION_TIMEOUT: string
  readonly VITE_AUDIT_LOG_REFRESH_INTERVAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
