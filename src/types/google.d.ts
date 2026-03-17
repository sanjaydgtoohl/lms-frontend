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


interface Window {
  particlesJS: (id: string, config: any) => void;
}
