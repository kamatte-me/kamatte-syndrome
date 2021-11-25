declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production';

    readonly MICROCMS_SERVICE_ID: string;
    readonly MICROCMS_API_KEY: string;
    readonly LINE_ACCESS_TOKEN: string;
    readonly NEXT_PUBLIC_GOOGLE_TRACKING_ID: string;
  }
}
