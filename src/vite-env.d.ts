/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_TRN_RPC_URL: string
  readonly VITE_FUTUREPASS_API_URL: string
  readonly VITE_FUTUREPASS_CLIENT_ID: string
  readonly VITE_FUTUREPASS_ACCESS_TOKEN: string
  readonly MODE: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
