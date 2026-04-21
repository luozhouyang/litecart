/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BETTER_AUTH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
