import { MC } from "@/constants/theme";
import { useSpotifyAuth } from "@/context/spotify-auth-context";
import {
  getSavedTracks,
  getPlaylists,
  SpotifySavedTrack,
  SpotifyPlaylist,
} from "@/services/spotify";
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

type Tab = "favorites" | "downloads" | "playlists";

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

function SongRow({ item, index }: { item: SpotifySavedTrack; index: number }) {
  const [liked, setLiked] = useState(true);
  const imageUrl = item.track.album.images[0]?.url;
  const color = colorForIndex(index);

  return (
    <TouchableOpacity style={styles.songRow} activeOpacity={0.75}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.songArt} />
      ) : (
        <View style={[styles.songArt, { backgroundColor: color }]}>
          <Text style={styles.songInitials}>{initials(item.track.name)}</Text>
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.track.name}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.track.artists[0]?.name}</Text>
      </View>
      <Text style={styles.songDuration}>{formatDuration(item.track.duration_ms)}</Text>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => setLiked(!liked)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.actionIcon, liked && styles.actionIconActive]}>
          {liked ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function PlaylistRow({ item, index }: { item: SpotifyPlaylist; index: number }) {
  const imageUrl = item.images[0]?.url;
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
        <Text style={styles.songArtist}>{item.tracks?.total ?? 0} songs</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
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
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  const [savedTracks, setSavedTracks] = useState<SpotifySavedTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([getSavedTracks(token), getPlaylists(token)])
      .then(([tracks, lists]) => {
        setSavedTracks(tracks);
        setPlaylists(lists);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "favorites", label: "Favorites" },
    { key: "downloads", label: "Downloads" },
    { key: "playlists", label: "Playlists" },
  ];

  const counts = {
    favorites: savedTracks.length,
    downloads: 0,
    playlists: playlists.length,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={MC.accent} size="large" />
        </View>
      );
    }

    if (activeTab === "favorites") {
      if (!savedTracks.length) return <EmptyState message="No saved songs yet" />;
      return (
        <FlatList
          data={savedTracks}
          keyExtractor={(item) => item.track.id}
          renderItem={({ item, index }) => <SongRow item={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      );
    }

    if (activeTab === "downloads") {
      return <EmptyState message="Downloaded songs appear here" />;
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
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

      {/* Count */}
      {!loading && (
        <Text style={styles.countText}>
          {counts[activeTab]} {activeTab === "playlists" ? "playlists" : "songs"}
        </Text>
      )}

      {/* Content */}
      {renderContent()}
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
  songDuration: { color: MC.textMuted, fontSize: 12, marginRight: 14 },
  actionBtn: { paddingLeft: 4 },
  actionIcon: { fontSize: 20, color: MC.textMuted },
  actionIconActive: { color: MC.accent },
  chevron: { color: MC.textMuted, fontSize: 24, fontWeight: "300" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { color: MC.textMuted, fontSize: 15 },
});
