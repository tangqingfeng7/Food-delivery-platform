/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAP_KEY: string
  readonly VITE_AMAP_SECURITY_CODE: string
  // 更多环境变量可以在这里添加...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
