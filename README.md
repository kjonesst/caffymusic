# caffy ♪

A music streaming mobile application built with React Native and Expo, powered by the Spotify Web API. Caffy is a learning project focused on building a clean, dark-themed UI for discovering and organising music.

## Features

- **Authentication** — Spotify OAuth 2.0 login with PKCE flow via `expo-auth-session`
- **Home** — Real-time data from Spotify: your top artist featured card, top artists, top tracks, and new releases
- **Library** — Organise saved music across Favourites, Downloads, and Playlists tabs
- **Profile** — View listening stats, top artists, and listening history
- **Settings** — Control audio quality, downloads, notifications, and privacy — accessed via the profile page

## Tech Stack

- [Expo](https://expo.dev) (v54) with [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- React Native with TypeScript
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) for music data
- `expo-auth-session` + `expo-web-browser` for Spotify OAuth 2.0 (PKCE)
- `react-native-safe-area-context` for safe area handling
- `react-native-reanimated` for animations
- SF Symbols (iOS) / Material Icons (Android) via `expo-symbols` and `@expo/vector-icons`

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with your Spotify Client ID:

   ```
   EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
   ```

   Get a Client ID by creating an app at [developer.spotify.com](https://developer.spotify.com/dashboard). Add the following Redirect URIs in your Spotify app settings:
   - `exp://<your-local-ip>:8081` (development)
   - `caffymusic://` (production)

3. Start the development server

   ```bash
   npx expo start
   ```

4. Open the app in one of:
   - [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [Expo Go](https://expo.dev/go)

## Project Structure

```
app/
  (tabs)/
    index.tsx      # Home screen — live Spotify data
    library.tsx    # Library screen
    profile.tsx    # Profile screen
  login.tsx        # Spotify login screen
  settings.tsx     # Settings (navigated to from Profile)
  _layout.tsx      # Root stack layout with auth gate

components/
  ui/
    icon-symbol.tsx  # Cross-platform icon component

constants/
  theme.ts         # Colour palette and font tokens

context/
  spotify-auth-context.tsx  # Spotify auth state and token management

services/
  spotify.ts       # Typed Spotify Web API fetch wrappers

hooks/
  use-spotify-auth.ts  # Auth hook (delegates to context)
```

## Branch

Active development is on the `new-feature-initialisations` branch.
