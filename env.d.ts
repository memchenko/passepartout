declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        API_KEY: string;
        APP_PATH: string;
        BUILD_PATH: string;
        RESULT_PATH: string;
        LOG_PATH: string;
        VECTORSTORE_PATH: string;
      }
    }
  }
}
