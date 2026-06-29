import { MC } from "@/constants/theme";
import { useSpotifyAuth } from "@/context/spotify-auth-context";
import {
  getMe,
  getTopArtists,
  getRecentlyPlayed,
  getSavedTracks,
  getPlaylists,
  SpotifyArtist,
  RecentlyPlayed,
  SpotifyUser,
} from "@/services/spotify";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return days === 1 ? "Yesterday" : `${days} days ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TopArtistRow({ item, index }: { item: SpotifyArtist; index: number }) {
  const imageUrl = item.images[0]?.url;
  const color = colorForIndex(index);
  const barWidth = `${100 - index * 20}%` as any;

  return (
    <TouchableOpacity style={styles.topArtistRow} activeOpacity={0.75}>
      <Text style={styles.topArtistRank}>{index + 1}</Text>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.topArtistAvatar} />
      ) : (
        <View style={[styles.topArtistAvatar, { backgroundColor: color }]}>
          <Text style={styles.topArtistInitials}>{initials(item.name)}</Text>
        </View>
      )}
      <View style={styles.topArtistInfo}>
        <Text style={styles.topArtistName}>{item.name}</Text>
        <Text style={styles.topArtistGenre} numberOfLines={1}>{item.genres[0] ?? "Artist"}</Text>
      </View>
      <View style={styles.topArtistBar}>
        <View style={[styles.topArtistBarFill, { width: barWidth }]} />
      </View>
    </TouchableOpacity>
  );
}

function HistoryRow({ item }: { item: RecentlyPlayed }) {
  const imageUrl = item.track.album.images[0]?.url;

  return (
    <TouchableOpacity style={styles.historyRow} activeOpacity={0.75}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.historyArt} />
      ) : (
        <View style={[styles.historyArt, { backgroundColor: colorForIndex(0) }]}>
          <Text style={styles.historyInitials}>{initials(item.track.name)}</Text>
        </View>
      )}
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={1}>{item.track.name}</Text>
        <Text style={styles.historyArtist} numberOfLines={1}>{item.track.artists[0]?.name}</Text>
      </View>
      <Text style={styles.historyWhen}>{timeAgo(item.played_at)}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { token, logout } = useSpotifyAuth();
  const router = useRouter();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getMe(token),
      getTopArtists(token, 3),
      getRecentlyPlayed(token),
      getSavedTracks(token, 50),
      getPlaylists(token, 50),
    ]).then(([me, artists, recent, saved, playlists]) => {
      setUser(me);
      setTopArtists(artists);
      setRecentlyPlayed(recent);
      setSavedCount(saved.length);
      setPlaylistCount(playlists.length);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={MC.accent} size="large" />
      </SafeAreaView>
    );
  }

  const profileImage = user?.images[0]?.url;
  const displayName = user?.display_name ?? "";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={MC.bg} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.settingsBtn} onPress={logout}>
              <Text style={styles.settingsBtnText}>↩</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push("/settings")}
            >
              <Text style={styles.settingsBtnText}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(displayName)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Saved" value={String(savedCount)} />
          <StatCard label="Playlists" value={String(playlistCount)} />
          <StatCard label="Artists" value={String(topArtists.length > 0 ? "∞" : "0")} />
        </View>

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Artists This Month</Text>
            <View style={styles.card}>
              {topArtists.map((artist, index) => (
                <React.Fragment key={artist.id}>
                  <TopArtistRow item={artist} index={index} />
                  {index < topArtists.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Listening History */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <View style={styles.card}>
              {recentlyPlayed.map((item, index) => (
                <React.Fragment key={`${item.track.id}-${item.played_at}`}>
                  <HistoryRow item={item} />
                  {index < recentlyPlayed.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MC.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: MC.textPrimary, letterSpacing: -0.5 },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MC.surface,
    borderWidth: 1,
    borderColor: MC.border,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtnText: { fontSize: 16, color: MC.textSecondary },
  headerActions: { flexDirection: "row", gap: 8 },
  profileSection: { alignItems: "center", paddingBottom: 28 },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: MC.accentLight,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatar: {
    width: "100%",
    height: "100%",
    backgroundColor: MC.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 30, letterSpacing: -1 },
  profileName: { fontSize: 24, fontWeight: "800", color: MC.textPrimary, letterSpacing: -0.5 },
  statsRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 28, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: MC.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: MC.border,
  },
  statValue: { fontSize: 24, fontWeight: "800", color: MC.textPrimary, letterSpacing: -0.5 },
  statLabel: {
    fontSize: 11,
    color: MC.textMuted,
    marginTop: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MC.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  card: {
    backgroundColor: MC.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MC.border,
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: MC.border, marginLeft: 66 },
  topArtistRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  topArtistRank: { width: 22, fontSize: 14, fontWeight: "700", color: MC.textMuted, marginRight: 12 },
  topArtistAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  topArtistInitials: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 13 },
  topArtistInfo: { flex: 1 },
  topArtistName: { color: MC.textPrimary, fontWeight: "600", fontSize: 14 },
  topArtistGenre: { color: MC.textMuted, fontSize: 11, marginTop: 2 },
  topArtistBar: { width: 60, height: 4, backgroundColor: MC.border, borderRadius: 2, overflow: "hidden" },
  topArtistBarFill: { height: "100%", backgroundColor: MC.accent, borderRadius: 2 },
  historyRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  historyArt: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  historyInitials: { color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 13 },
  historyInfo: { flex: 1 },
  historyTitle: { color: MC.textPrimary, fontWeight: "600", fontSize: 14 },
  historyArtist: { color: MC.textSecondary, fontSize: 12, marginTop: 2 },
  historyWhen: { color: MC.textMuted, fontSize: 11 },
});
