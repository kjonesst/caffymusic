# caffy ♪

A music streaming mobile application built with React Native and Expo, powered by the Spotify Web API. Caffy is a learning project focused on building a clean, dark-themed UI for discovering and organising music.

## Features

- **Authentication** — Spotify OAuth 2.0 login with PKCE flow via `expo-auth-session`
- **Home** — Real-time data from Spotify: your top artist featured card, top artists, top tracks, and new releases
- **Library** — Organise saved music across Favourites, Downloads, and Playlists tabs
- **Profile** — View listening stats, top artists, and listening history
- **Settings** — Control audio quality, downloads, notifications, and privacy — accessed via the profile page
- **Mini player** — In-app Spotify embed playback via `MiniPlayer`
- **Floating tab bar** — Custom blurred, pill-shaped tab bar (`FloatingTabBar`) with a bottom fade (`BottomFade`) over scrollable content
- **Local favourites & downloads** — Favourited tracks and locally-added tracks persisted with `AsyncStorage`

## Tech Stack

- [Expo](https://expo.dev) (v54) with [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- React Native with TypeScript
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) for music data
- `expo-auth-session` + `expo-web-browser` for Spotify OAuth 2.0 (PKCE)
- `react-native-safe-area-context` for safe area handling
- `react-native-reanimated` + `expo-blur` for animations and blur effects
- `react-native-webview` for in-app Spotify track embeds
- `@react-native-async-storage/async-storage` for local persistence (favourites, downloads)
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

   > **Note:** As of March 2026, Spotify requires the app owner's account to have an active Premium subscription to use Development Mode at all. A free account can no longer register/run a Development Mode app, regardless of which endpoints it calls.

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
    _layout.tsx    # Tab layout — wires up FloatingTabBar
    index.tsx      # Home screen — live Spotify data
    library.tsx    # Library screen
    profile.tsx    # Profile screen
  login.tsx        # Spotify login screen
  settings.tsx     # Settings (navigated to from Profile)
  _layout.tsx      # Root stack layout with auth gate

components/
  MiniPlayer.tsx        # In-app Spotify track embed player
  floating-tab-bar.tsx  # Custom blurred pill tab bar + TAB_BAR_CLEARANCE
  bottom-fade.tsx        # Blurred fade overlay above the tab bar
  haptic-tab.tsx         # Tab button wrapper with haptic feedback
  typewriter-text.tsx    # Animated typewriter text effect
  ui/
    icon-symbol.tsx  # Cross-platform icon component

constants/
  theme.ts         # Colour palette and font tokens

context/
  spotify-auth-context.tsx   # Spotify auth state and token management
  favorites-context.tsx      # Favourited tracks, persisted via AsyncStorage
  local-tracks-context.tsx   # Locally-added tracks, persisted via AsyncStorage

services/
  spotify.ts       # Typed Spotify Web API fetch wrappers

hooks/
  use-color-scheme.ts  # Colour scheme hook (native)
```

## Branch

Active development is on the `read-me` branch.
