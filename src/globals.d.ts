export {}
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

interface GoogleOAuth2TokenClient {
  requestAccessToken: (options: { prompt: string }) => void;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string; error?: string }) => void;
    }) => GoogleOAuth2TokenClient;
  };
}

interface GoogleGlobal {
  accounts: GoogleAccounts;
}


declare global {
  interface Window {
    google: GoogleGlobal;
  }
}

