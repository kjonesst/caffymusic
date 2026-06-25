import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpotifyAuthProvider, useSpotifyAuth } from '@/context/spotify-auth-context';

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
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SpotifyAuthProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
        <AuthGate />
        <StatusBar style="auto" />
      </SpotifyAuthProvider>
    </ThemeProvider>
  );
}
