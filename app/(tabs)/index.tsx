import { MC } from "@/constants/theme";
import { useSpotifyAuth } from "@/context/spotify-auth-context";
import {
  getMe,
  getNewReleases,
  getTopArtists,
  getTopTracks,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyTrack,
} from "@/services/spotify";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AVATAR_COLORS = [
  "#7A1E2A", "#5E3E82", "#3E5E82", "#3E825E",
  "#823E5E", "#825E3E", "#3E8282", "#6E5E3E",
];

function colorForIndex(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ArtistCard({ item, index }: { item: SpotifyArtist; index: number }) {
  const imageUrl = item.images[0]?.url;
  const color = colorForIndex(index);
  return (
    <TouchableOpacity style={styles.artistCard} activeOpacity={0.75}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.artistAvatar} />
      ) : (
        <View style={[styles.artistAvatar, { backgroundColor: color }]}>
          <Text style={styles.artistInitials}>{initials(item.name)}</Text>
        </View>
      )}
      <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.artistGenre} numberOfLines={1}>{item.genres[0] ?? "Artist"}</Text>
    </TouchableOpacity>
  );
}

function TrendingCard({ item, index }: { item: SpotifyTrack; index: number }) {
  const imageUrl = item.album.images[0]?.url;
  const color = colorForIndex(index);
  const rank = String(index + 1).padStart(2, "0");
  return (
    <TouchableOpacity style={styles.trendingCard} activeOpacity={0.75}>
      <View style={[styles.trendingTop, { backgroundColor: color }]}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFillObject} />
        )}
        <Text style={styles.trendingRank}>{rank}</Text>
      </View>
      <View style={styles.trendingBottom}>
        <Text style={styles.trendingTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.trendingArtist} numberOfLines={1}>{item.artists[0]?.name}</Text>
        <Text style={styles.trendingPlays}>{item.popularity}% popularity</Text>
      </View>
    </TouchableOpacity>
  );
}

function ReleaseRow({ item, index }: { item: SpotifyAlbum; index: number }) {
  const [liked, setLiked] = useState(false);
  const imageUrl = item.images[0]?.url;
  const color = colorForIndex(index);
  const meta =
    item.album_type.charAt(0).toUpperCase() + item.album_type.slice(1) +
    (item.total_tracks > 1 ? ` • ${item.total_tracks} tracks` : "");
  return (
    <TouchableOpacity style={styles.releaseRow} activeOpacity={0.75}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.releaseArt} />
      ) : (
        <View style={[styles.releaseArt, { backgroundColor: color }]}>
          <Text style={styles.releaseInitials}>{initials(item.name)}</Text>
        </View>
      )}
      <View style={styles.releaseInfo}>
        <Text style={styles.releaseTitle}>{item.name}</Text>
        <Text style={styles.releaseArtist}>{item.artists[0]?.name}</Text>
        <Text style={styles.releaseMeta}>{meta}</Text>
      </View>
      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => setLiked(!liked)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>
          {liked ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { token } = useSpotifyAuth();
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [releases, setReleases] = useState<SpotifyAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getMe(token),
      getTopArtists(token),
      getTopTracks(token),
      getNewReleases(token),
    ]).then(([me, topArtists, topTracks, newReleases]) => {
      setUserName(me.display_name);
      setUserImage(me.images[0]?.url ?? null);
      setArtists(topArtists);
      setTracks(topTracks);
      setReleases(newReleases);
    }).finally(() => setLoading(false));
  }, [token]);

  const featured = artists[0];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={MC.accent} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={MC.bg} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Wordmark */}
        <View style={styles.wordmarkRow}>
          <Text style={styles.wordmark}>caffy</Text>
          <Text style={styles.wordmarkNote}>☕️</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.headerAvatar}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.headerAvatarImage} />
            ) : (
              <Text style={styles.headerAvatarText}>{initials(userName)}</Text>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists, songs, albums..."
            placeholderTextColor={MC.textMuted}
            value={search}
            onChangeText={setSearch}
            selectionColor={MC.accent}
          />
        </View>

        {/* Featured Card */}
        {featured && (
          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: colorForIndex(0) }]}
            activeOpacity={0.85}
          >
            {featured.images[0]?.url && (
              <Image
                source={{ uri: featured.images[0].url }}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 20, opacity: 0.4 }]}
              />
            )}
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Your Top Artist</Text>
            </View>
            <View style={styles.featuredContent}>
              <View style={styles.featuredText}>
                <Text style={styles.featuredName}>{featured.name}</Text>
                <Text style={styles.featuredTagline}>{featured.genres[0] ?? ""}</Text>
                <Text style={styles.featuredGenre}>{featured.genres[1] ?? ""}</Text>
                <TouchableOpacity style={styles.playNowBtn}>
                  <Text style={styles.playNowText}>▶ Listen Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.featuredAvatarCircle}>
                {featured.images[0]?.url ? (
                  <Image source={{ uri: featured.images[0].url }} style={styles.featuredAvatarImage} />
                ) : (
                  <Text style={styles.featuredAvatarText}>{initials(featured.name)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Discover Artists */}
        <SectionHeader title="Discover Artists" onPress={() => {}} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={artists}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ArtistCard item={item} index={index} />}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Trending Now */}
        <SectionHeader title="Trending Now" onPress={() => {}} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <TrendingCard item={item} index={index} />}
          contentContainerStyle={styles.horizontalList}
        />

        {/* New Releases */}
        <SectionHeader title="New Releases" onPress={() => {}} />
        <View style={styles.releaseList}>
          {releases.map((item, index) => (
            <ReleaseRow key={item.id} item={item} index={index} />
          ))}
        </View>

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
    paddingBottom: 20,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 4,
    paddingBottom: 20,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: "800",
    color: MC.accent,
    letterSpacing: 3,
    textTransform: "lowercase",
  },
  wordmarkNote: { fontSize: 16, color: MC.accentLight },
  greeting: { fontSize: 13, color: MC.textSecondary, letterSpacing: 0.3 },
  userName: { fontSize: 26, fontWeight: "700", color: MC.textPrimary, letterSpacing: -0.5 },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MC.accent,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarImage: { width: 42, height: 42, borderRadius: 21 },
  headerAvatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: MC.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: MC.border,
  },
  searchIcon: { fontSize: 20, color: MC.textMuted, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: MC.textPrimary, padding: 0 },
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
    overflow: "hidden",
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  featuredBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  featuredContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  featuredText: { flex: 1, paddingRight: 16 },
  featuredName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  featuredTagline: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 2 },
  featuredGenre: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 },
  playNowBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  playNowText: { color: "#0D0B0E", fontWeight: "700", fontSize: 13 },
  featuredAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  featuredAvatarImage: { width: 80, height: 80, borderRadius: 40 },
  featuredAvatarText: { color: "#fff", fontWeight: "800", fontSize: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: MC.textPrimary, letterSpacing: -0.3 },
  seeAll: { fontSize: 13, color: MC.accent, fontWeight: "600" },
  horizontalList: { paddingHorizontal: 20, gap: 14, marginBottom: 28 },
  artistCard: { width: 82, alignItems: "center" },
  artistAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  artistInitials: { color: "#fff", fontWeight: "800", fontSize: 20 },
  artistName: { color: MC.textPrimary, fontSize: 12, fontWeight: "600", textAlign: "center" },
  artistGenre: { color: MC.textMuted, fontSize: 10, textAlign: "center", marginTop: 2 },
  trendingCard: { width: 136, borderRadius: 14, overflow: "hidden", backgroundColor: MC.surface },
  trendingTop: { height: 96, alignItems: "center", justifyContent: "center" },
  trendingRank: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -2,
  },
  trendingBottom: { padding: 12, gap: 2 },
  trendingTitle: { color: MC.textPrimary, fontWeight: "700", fontSize: 13, lineHeight: 17 },
  trendingArtist: { color: MC.textSecondary, fontSize: 11, marginTop: 2 },
  trendingPlays: { color: MC.textMuted, fontSize: 10, marginTop: 4 },
  releaseList: { paddingHorizontal: 20, gap: 4 },
  releaseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MC.border,
  },
  releaseArt: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  releaseInitials: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: -0.5,
  },
  releaseInfo: { flex: 1 },
  releaseTitle: { color: MC.textPrimary, fontWeight: "700", fontSize: 15 },
  releaseArtist: { color: MC.textSecondary, fontSize: 13, marginTop: 2 },
  releaseMeta: { color: MC.textMuted, fontSize: 11, marginTop: 3 },
  likeButton: { paddingLeft: 12 },
  likeIcon: { fontSize: 22, color: MC.textMuted },
  likeIconActive: { color: MC.accent },
});
