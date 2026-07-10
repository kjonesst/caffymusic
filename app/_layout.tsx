import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { SpotifyAuthProvider, useSpotifyAuth } from '@/context/spotify-auth-context';
import { LocalTracksProvider } from '@/context/local-tracks-context';
import { FavoritesProvider } from '@/context/favorites-context';

function AuthGate() {
  const { token } = useSpotifyAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!segments.length) return;
    const inLoginScreen = segments[0] === 'login';
    const timeout = setTimeout(() => {
      if (!token && !inLoginScreen) {
        router.replace('/login');
      } else if (token && inLoginScreen) {
        router.replace('/(tabs)');
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [token, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <SpotifyAuthProvider>
      <FavoritesProvider>
      <LocalTracksProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
        <AuthGate />
        <StatusBar style="auto" />
      </LocalTracksProvider>
      </FavoritesProvider>
      </SpotifyAuthProvider>
    </ThemeProvider>
  );
}
