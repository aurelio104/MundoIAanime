/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Agrega otras variables si las usas:
  // readonly VITE_OTRA_VARIABLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
