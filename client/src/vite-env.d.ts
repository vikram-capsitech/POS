/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URI: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
