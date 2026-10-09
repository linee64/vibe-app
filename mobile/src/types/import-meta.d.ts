/**
 * Типы для веб-модулей, которые TypeScript видит через общий код (../src/lib/config.ts использует import.meta.env от Vite).
 * В рантайме приложения эти модули подменяются адаптерами (metro.config.js), поэтому тут только типы.
 */
interface ImportMetaEnv {
  readonly [key: string]: string | undefined
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Подставляет vite.config.ts в вебе; в мобильном рантайме веб-config подменён адаптером */
declare const __APP_VERSION__: string
