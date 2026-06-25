# caffy ♪

A music streaming mobile application built with React Native and Expo. Caffy is a learning project focused on building a clean, dark-themed UI for discovering and organising music.

## Features

- **Home** — Discover new music with a featured artist card, artist browsing, trending tracks, and new releases
- **Library** — Organise saved music across Favourites, Downloads, and Playlists tabs
- **Profile** — View listening stats, top artists, and listening history
- **Settings** — Control audio quality, downloads, notifications, and privacy — accessed via the profile page

## Tech Stack

- [Expo](https://expo.dev) (v54) with [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- React Native with TypeScript
- `react-native-safe-area-context` for safe area handling
- `react-native-reanimated` for animations
- SF Symbols (iOS) / Material Icons (Android) via `expo-symbols` and `@expo/vector-icons`

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

3. Open the app in one of:
   - [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [Expo Go](https://expo.dev/go)

## Project Structure

```
app/
  (tabs)/
    index.tsx      # Home screen
    library.tsx    # Library screen
    profile.tsx    # Profile screen
  settings.tsx     # Settings (navigated to from Profile)
  _layout.tsx      # Root stack layout

components/
  ui/
    icon-symbol.tsx  # Cross-platform icon component

constants/
  theme.ts         # Colour palette and font tokens
```

## Branch

Active development is on the `new-feature-initialisations` branch.
