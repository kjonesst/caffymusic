import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { SpotifyTrack } from "@/services/spotify";

const STORAGE_KEY = "caffy_favorites";

type FavoritesContextType = {
  favorites: SpotifyTrack[];
  isFavorited: (id: string) => boolean;
  toggleFavorite: (track: SpotifyTrack) => void;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorited: () => false,
  toggleFavorite: () => {},
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<SpotifyTrack[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setFavorites(JSON.parse(raw));
    });
  }, []);

  function toggleFavorite(track: SpotifyTrack) {
    setFavorites((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      const next = exists ? prev.filter((t) => t.id !== track.id) : [track, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function isFavorited(id: string) {
    return favorites.some((t) => t.id === id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
