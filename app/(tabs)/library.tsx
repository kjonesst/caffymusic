import { BottomFade } from "@/components/bottom-fade";
import { TAB_BAR_CLEARANCE } from "@/components/floating-tab-bar";
import { MC } from "@/constants/theme";
import { useFavorites } from "@/context/favorites-context";
import { useLocalTracks, LocalTrack } from "@/context/local-tracks-context";
import { useSpotifyAuth } from "@/context/spotify-auth-context";
import {
  getPlaylists,
  SpotifyTrack,
  SpotifyPlaylist,
} from "@/services/spotify";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect, useRef, useState } from "react";
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

type Tab = "favorites" | "mytracks" | "playlists";

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

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SpotifySongRow({ item, index }: { item: SpotifyTrack; index: number }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const fav = isFavorited(item.id);
  const imageUrl = item.album.images[0]?.url;
  const color = colorForIndex(index);
  return (
    <TouchableOpacity style={styles.songRow} activeOpacity={0.75}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.songArt} />
      ) : (
        <View style={[styles.songArt, { backgroundColor: color }]}>
          <Text style={styles.songInitials}>{initials(item.name)}</Text>
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artists[0]?.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => toggleFavorite(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.actionIcon, fav && styles.actionIconActive]}>
          {fav ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function LocalTrackRow({
  item,
  isPlaying,
  onPress,
  onRemove,
}: {
  item: LocalTrack;
  isPlaying: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  const label = item.name.replace(/\.[^/.]+$/, ""); // strip extension
  return (
    <TouchableOpacity style={styles.songRow} activeOpacity={0.75} onPress={onPress}>
      <View style={[styles.songArt, styles.localArt]}>
        <Text style={styles.localArtIcon}>{isPlaying ? "▶" : "♪"}</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, isPlaying && styles.songTitleActive]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>Local file</Text>
      </View>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function LocalPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current && status.isLoaded) {
      hasStarted.current = true;
      player.play();
    }
  }, [status.isLoaded]);

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.localPlayer}>
      <View style={styles.localPlayerProgress}>
        <View style={[styles.localPlayerFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.localPlayerControls}>
        <TouchableOpacity
          onPress={() => status.playing ? player.pause() : player.play()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.localPlayerBtn}>{status.playing ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <Text style={styles.localPlayerTime}>
          {formatDuration(status.currentTime * 1000)} / {formatDuration(status.duration * 1000)}
        </Text>
        <TouchableOpacity
          onPress={() => player.seekTo(0)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.localPlayerBtn}>↺</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PlaylistRow({ item, index }: { item: SpotifyPlaylist; index: number }) {
  const imageUrl = item.images[0]?.url;
  const color = colorForIndex(index);
  return (
    <View style={styles.songRow}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.songArt} />
      ) : (
        <View style={[styles.songArt, { backgroundColor: color }]}>
          <Text style={styles.songInitials}>{initials(item.name)}</Text>
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.songArtist}>{item.items?.total ?? 0} songs</Text>
      </View>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export default function LibraryScreen() {
  const { token } = useSpotifyAuth();
  const { favorites } = useFavorites();
  const { tracks: localTracks, addTrack, removeTrack } = useLocalTracks();
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingUri, setPlayingUri] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getPlaylists(token)
      .then(setPlaylists)
      .finally(() => setLoading(false));
  }, [token]);

  async function pickAudioFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
      multiple: true,
    });
    if (result.canceled) return;

    // Ensure persistent storage directory exists
    const tracksDir = new Directory(Paths.document, "mytracks");
    if (!tracksDir.exists) tracksDir.create();

    for (const asset of result.assets) {
      // Derive a unique filename to avoid collisions
      const safeName = `${Date.now()}_${asset.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const dest = new File(tracksDir, safeName);

      // Copy from cache → document directory (survives OS cache clears)
      new File(asset.uri).copy(dest);

      addTrack({
        uri: dest.uri,
        name: asset.name,
        size: asset.size,
        addedAt: Date.now(),
      });
    }
    setActiveTab("mytracks");
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "favorites", label: "Favourites" },
    { key: "mytracks", label: "My Tracks" },
    { key: "playlists", label: "Playlists" },
  ];

  const counts: Record<Tab, number> = {
    favorites: favorites.length,
    mytracks: localTracks.length,
    playlists: playlists.length,
  };

  const renderContent = () => {
    if (loading && activeTab !== "mytracks") {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={MC.accent} size="large" />
        </View>
      );
    }

    if (activeTab === "favorites") {
      if (!favorites.length) return <EmptyState message="Search for songs and tap ♡ to favourite them" />;
      return (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <SpotifySongRow item={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      );
    }

    if (activeTab === "mytracks") {
      if (!localTracks.length) {
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No local tracks yet</Text>
            <Text style={styles.emptyHint}>Tap + to add music from your phone</Text>
          </View>
        );
      }
      return (
        <>
          {playingUri && (
            <LocalPlayer key={playingUri} uri={playingUri} />
          )}
          <FlatList
            data={localTracks}
            keyExtractor={(item) => item.uri}
            renderItem={({ item }) => (
              <LocalTrackRow
                item={item}
                isPlaying={playingUri === item.uri}
                onPress={() => setPlayingUri(item.uri === playingUri ? null : item.uri)}
                onRemove={() => {
                  if (playingUri === item.uri) setPlayingUri(null);
                  removeTrack(item.uri);
                }}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      );
    }

    if (!playlists.length) return <EmptyState message="No playlists yet" />;
    return (
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <PlaylistRow item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={MC.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity style={styles.addBtn} onPress={pickAudioFile}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {!loading && (
        <Text style={styles.countText}>
          {counts[activeTab]} {activeTab === "playlists" ? "playlists" : "songs"}
        </Text>
      )}

      {renderContent()}
      <BottomFade />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MC.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: MC.textPrimary, letterSpacing: -0.5 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MC.surface,
    borderWidth: 1,
    borderColor: MC.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: MC.accent, fontSize: 22, fontWeight: "300", lineHeight: 26 },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: MC.border,
    marginBottom: 12,
  },
  tab: { flex: 1, alignItems: "center", paddingBottom: 14, position: "relative" },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: "600", color: MC.textMuted, letterSpacing: 0.2 },
  tabTextActive: { color: MC.textPrimary },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    left: "20%",
    right: "20%",
    height: 2,
    backgroundColor: MC.accent,
    borderRadius: 2,
  },
  countText: {
    color: MC.textMuted,
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20 + TAB_BAR_CLEARANCE,
  },
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
  localArt: { backgroundColor: MC.surface, borderWidth: 1, borderColor: MC.border },
  localArtIcon: { fontSize: 20, color: MC.accent },
  songInitials: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 15 },
  songInfo: { flex: 1 },
  songTitle: { color: MC.textPrimary, fontWeight: "600", fontSize: 15 },
  songTitleActive: { color: MC.accent },
  songArtist: { color: MC.textSecondary, fontSize: 13, marginTop: 3 },
  songDuration: { color: MC.textMuted, fontSize: 12, marginRight: 14 },
  actionBtn: { paddingLeft: 4 },
  actionIcon: { fontSize: 20, color: MC.textMuted },
  actionIconActive: { color: MC.accent },
  removeIcon: { fontSize: 14, color: MC.textMuted },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyText: { color: MC.textMuted, fontSize: 15 },
  emptyHint: { color: MC.textMuted, fontSize: 13, opacity: 0.6 },
  localPlayer: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: MC.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MC.border,
    overflow: "hidden",
  },
  localPlayerProgress: { height: 3, backgroundColor: MC.border },
  localPlayerFill: { height: 3, backgroundColor: MC.accent },
  localPlayerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  localPlayerBtn: { fontSize: 22, color: MC.accent },
  localPlayerTime: { color: MC.textSecondary, fontSize: 13 },
});
