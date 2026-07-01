import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

export type LocalTrack = {
  uri: string;
  name: string;
  size?: number;
  addedAt: number;
};

type LocalTracksContextType = {
  tracks: LocalTrack[];
  addTrack: (track: LocalTrack) => void;
  removeTrack: (uri: string) => void;
};

const STORAGE_KEY = "caffy_local_tracks";

const LocalTracksContext = createContext<LocalTracksContextType>({
  tracks: [],
  addTrack: () => {},
  removeTrack: () => {},
});

export function LocalTracksProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<LocalTrack[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setTracks(JSON.parse(raw));
    });
  }, []);

  function addTrack(track: LocalTrack) {
    setTracks((prev) => {
      if (prev.some((t) => t.uri === track.uri)) return prev;
      const next = [track, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeTrack(uri: string) {
    setTracks((prev) => {
      const next = prev.filter((t) => t.uri !== uri);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <LocalTracksContext.Provider value={{ tracks, addTrack, removeTrack }}>
      {children}
    </LocalTracksContext.Provider>
  );
}

export function useLocalTracks() {
  return useContext(LocalTracksContext);
}
