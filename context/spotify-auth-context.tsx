import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'playlist-read-private',
];

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

type SpotifyAuthContextType = {
  token: string | null;
  request: AuthSession.AuthRequest | null;
  promptAsync: () => void;
};

const SpotifyAuthContext = createContext<SpotifyAuthContextType>({
  token: null,
  request: null,
  promptAsync: () => {},
});

export function SpotifyAuthProvider({ children }: { children: React.ReactNode }) {
  const redirectUri = AuthSession.makeRedirectUri();
  const [token, setToken] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code, request!.codeVerifier!, redirectUri);
    }
  }, [response]);

  async function exchangeCodeForToken(code: string, codeVerifier: string, redirectUri: string) {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
    }
  }

  return (
    <SpotifyAuthContext.Provider value={{ token, request, promptAsync }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
}

export function useSpotifyAuth() {
  return useContext(SpotifyAuthContext);
}
