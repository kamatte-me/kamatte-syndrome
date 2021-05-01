declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production';

    readonly MICROCMS_SERVICE_ID: string;
    readonly MICROCMS_API_KEY: string;
  }
}
