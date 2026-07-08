import { MC } from "@/constants/theme";
import { useFavorites } from "@/context/favorites-context";
import { useSpotifyAuth } from "@/context/spotify-auth-context";
import { getPlaylistTracks, SpotifySavedTrack } from "@/services/spotify";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AVATAR_COLORS = [
  "#7A1E2A", "#5E3E82", "#3E5E82", "#3E825E",
  "#823E5E", "#825E3E", "#3E8282", "#6E5E3E",
];

function colorForIndex(i: number) {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function TrackRow({ item, index }: { item: SpotifySavedTrack; index: number }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const track = item.track;
  if (!track) return null;
  const fav = isFavorited(track.id);
  const imageUrl = track.album?.images?.[0]?.url;
  const color = colorForIndex(index);
  return (
    <View style={styles.songRow}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.songArt} />
      ) : (
        <View style={[styles.songArt, { backgroundColor: color }]}>
          <Text style={styles.songInitials}>{initials(track.name)}</Text>
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {track.artists.map((a) => a.name).join(", ")}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => toggleFavorite(track)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.actionIcon, fav && styles.actionIconActive]}>
          {fav ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlaylistScreen() {
  const router = useRouter();
  const { token } = useSpotifyAuth();
  const { id, name, image } = useLocalSearchParams<{ id: string; name?: string; image?: string }>();
  const [tracks, setTracks] = useState<SpotifySavedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    setError(null);
    getPlaylistTracks(token, id)
      .then(setTracks)
      .catch(() => setError("This playlist's songs aren't available right now."))
      .finally(() => setLoading(false));
  }, [token, id]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={MC.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle} numberOfLines={1}>{name ?? "Playlist"}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.playlistHero}>
        {image ? (
          <Image source={{ uri: image }} style={styles.heroArt} />
        ) : (
          <View style={[styles.heroArt, styles.heroArtFallback]}>
            <Text style={styles.heroInitials}>{initials(name ?? "Playlist")}</Text>
          </View>
        )}
        <Text style={styles.heroTitle} numberOfLines={2}>{name}</Text>
        {!loading && !error && (
          <Text style={styles.heroCount}>{tracks.length} songs</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={MC.accent} size="large" />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : !tracks.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>This playlist has no songs</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item, index) => item.track?.id ?? `local-${index}`}
          renderItem={({ item, index }) => <TrackRow item={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MC.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MC.surface,
    borderWidth: 1,
    borderColor: MC.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: MC.textPrimary, fontSize: 24, fontWeight: "300", lineHeight: 28 },
  pageTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: MC.textPrimary, marginHorizontal: 8 },
  playlistHero: { alignItems: "center", paddingVertical: 16, paddingHorizontal: 20 },
  heroArt: { width: 160, height: 160, borderRadius: 14, marginBottom: 14 },
  heroArtFallback: { backgroundColor: MC.surface, alignItems: "center", justifyContent: "center" },
  heroInitials: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 36 },
  heroTitle: { color: MC.textPrimary, fontSize: 20, fontWeight: "800", textAlign: "center" },
  heroCount: { color: MC.textMuted, fontSize: 13, marginTop: 6 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  songRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  separator: { height: 1, backgroundColor: MC.border },
  songArt: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  songInitials: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 15 },
  songInfo: { flex: 1 },
  songTitle: { color: MC.textPrimary, fontWeight: "600", fontSize: 15 },
  songArtist: { color: MC.textSecondary, fontSize: 13, marginTop: 3 },
  actionBtn: { paddingLeft: 4 },
  actionIcon: { fontSize: 20, color: MC.textMuted },
  actionIconActive: { color: MC.accent },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
  emptyText: { color: MC.textMuted, fontSize: 15 },
});
