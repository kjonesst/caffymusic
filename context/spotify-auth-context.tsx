import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry'; // unix ms
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'user-read-recently-played',
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
  logout: () => void;
};

const SpotifyAuthContext = createContext<SpotifyAuthContextType>({
  token: null,
  request: null,
  promptAsync: () => {},
  logout: () => {},
});

export function SpotifyAuthProvider({ children }: { children: React.ReactNode }) {
  const redirectUri = AuthSession.makeRedirectUri();
  const [token, setToken] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadStoredToken();
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  async function loadStoredToken() {
    const [stored, expiry, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(TOKEN_EXPIRY_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (!stored) return;

    const expiresAt = expiry ? parseInt(expiry, 10) : 0;
    const now = Date.now();

    if (expiresAt > now + 60_000) {
      // Token is still valid — use it and schedule a refresh
      setToken(stored);
      scheduleRefresh(expiresAt, refreshToken);
    } else if (refreshToken) {
      // Token expired — refresh immediately
      await doRefresh(refreshToken);
    }
  }

  function scheduleRefresh(expiresAt: number, refreshToken: string | null) {
    if (!refreshToken) return;
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const delay = expiresAt - Date.now() - 5 * 60_000; // 5 min before expiry
    if (delay > 0) {
      refreshTimer.current = setTimeout(() => doRefresh(refreshToken), delay);
    } else {
      doRefresh(refreshToken);
    }
  }

  async function doRefresh(refreshToken: string): Promise<string | null> {
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
        }).toString(),
      });

      const data = await res.json();
      if (!data.access_token) return null;

      const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
      const newRefresh = data.refresh_token ?? refreshToken;

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, data.access_token),
        SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, String(expiresAt)),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefresh),
      ]);

      setToken(data.access_token);
      scheduleRefresh(expiresAt, newRefresh);
      return data.access_token;
    } catch {
      return null;
    }
  }

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
    if (!data.access_token) return;

    const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;

    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, data.access_token),
      SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, String(expiresAt)),
      data.refresh_token
        ? SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refresh_token)
        : Promise.resolve(),
    ]);

    setToken(data.access_token);
    scheduleRefresh(expiresAt, data.refresh_token ?? null);
  }

  async function logout() {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY),
    ]);
    setToken(null);
  }

  return (
    <SpotifyAuthContext.Provider value={{ token, request, promptAsync, logout }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
}

export function useSpotifyAuth() {
  return useContext(SpotifyAuthContext);
}
