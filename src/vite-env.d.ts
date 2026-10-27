/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE: string
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_I18N_LOCALE: string
  readonly VITE_APP_I18N_FALLBACK_LOCALE: string
  readonly VITE_APP_API_BASE_AI_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
