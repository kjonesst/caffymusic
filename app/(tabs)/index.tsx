import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MC } from "@/constants/theme";

const FEATURED = {
  name: "Kendrick Lamar",
  tagline: "Pulitzer Prize Winner",
  genre: "Hip-Hop / Rap",
  color: "#7A1E2A",
  initials: "KL",
};

const ARTISTS = [
  { id: "1", name: "SZA", genre: "R&B / Soul", color: "#5E3E82", initials: "SZ" },
  { id: "2", name: "Frank Ocean", genre: "Alternative R&B", color: "#3E5E82", initials: "FO" },
  { id: "3", name: "Tyler, The Creator", genre: "Hip-Hop", color: "#3E825E", initials: "TC" },
  { id: "4", name: "Billie Eilish", genre: "Pop / Alt", color: "#823E5E", initials: "BE" },
  { id: "5", name: "The Weeknd", genre: "R&B", color: "#825E3E", initials: "TW" },
  { id: "6", name: "Doja Cat", genre: "Pop / Rap", color: "#3E8282", initials: "DC" },
  { id: "7", name: "Drake", genre: "Hip-Hop", color: "#6E5E3E", initials: "DR" },
];

const TRENDING = [
  { id: "1", title: "Not Like Us", artist: "Kendrick Lamar", plays: "847M plays", color: "#7A1E2A", rank: "01" },
  { id: "2", title: "Snooze", artist: "SZA", plays: "623M plays", color: "#5E3E82", rank: "02" },
  { id: "3", title: "Blinding Lights", artist: "The Weeknd", plays: "4.2B plays", color: "#825E3E", rank: "03" },
  { id: "4", title: "Birds of a Feather", artist: "Billie Eilish", plays: "412M plays", color: "#823E5E", rank: "04" },
  { id: "5", title: "Timeless", artist: "The Weeknd", plays: "389M plays", color: "#3E5E82", rank: "05" },
];

const NEW_RELEASES = [
  { id: "1", title: "GNX", artist: "Kendrick Lamar", meta: "Album • 12 tracks", color: "#7A1E2A", initials: "GNX" },
  { id: "2", title: "Chromakopia", artist: "Tyler, The Creator", meta: "Album • 14 tracks", color: "#3E825E", initials: "CHR" },
  { id: "3", title: "Hit Me Hard and Soft", artist: "Billie Eilish", meta: "Album • 10 tracks", color: "#823E5E", initials: "HMH" },
  { id: "4", title: "Lamin", artist: "SZA", meta: "Single", color: "#5E3E82", initials: "LAM" },
];

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

function ArtistCard({ item }: { item: (typeof ARTISTS)[0] }) {
  return (
    <TouchableOpacity style={styles.artistCard} activeOpacity={0.75}>
      <View style={[styles.artistAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.artistInitials}>{item.initials}</Text>
      </View>
      <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.artistGenre} numberOfLines={1}>{item.genre}</Text>
    </TouchableOpacity>
  );
}

function TrendingCard({ item }: { item: (typeof TRENDING)[0] }) {
  return (
    <TouchableOpacity style={styles.trendingCard} activeOpacity={0.75}>
      <View style={[styles.trendingTop, { backgroundColor: item.color }]}>
        <Text style={styles.trendingRank}>{item.rank}</Text>
      </View>
      <View style={styles.trendingBottom}>
        <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.trendingArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.trendingPlays}>{item.plays}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ReleaseRow({ item }: { item: (typeof NEW_RELEASES)[0] }) {
  const [liked, setLiked] = useState(false);
  return (
    <TouchableOpacity style={styles.releaseRow} activeOpacity={0.75}>
      <View style={[styles.releaseArt, { backgroundColor: item.color }]}>
        <Text style={styles.releaseInitials}>{item.initials}</Text>
      </View>
      <View style={styles.releaseInfo}>
        <Text style={styles.releaseTitle}>{item.title}</Text>
        <Text style={styles.releaseArtist}>{item.artist}</Text>
        <Text style={styles.releaseMeta}>{item.meta}</Text>
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
  const [search, setSearch] = useState("");

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
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>Kenneth</Text>
          </View>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>KJ</Text>
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
        <TouchableOpacity
          style={[styles.featuredCard, { backgroundColor: FEATURED.color }]}
          activeOpacity={0.85}
        >
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Editor's Pick</Text>
          </View>
          <View style={styles.featuredContent}>
            <View style={styles.featuredText}>
              <Text style={styles.featuredName}>{FEATURED.name}</Text>
              <Text style={styles.featuredTagline}>{FEATURED.tagline}</Text>
              <Text style={styles.featuredGenre}>{FEATURED.genre}</Text>
              <TouchableOpacity style={styles.playNowBtn}>
                <Text style={styles.playNowText}>▶  Listen Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.featuredAvatarCircle}>
              <Text style={styles.featuredAvatarText}>{FEATURED.initials}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Discover Artists */}
        <SectionHeader title="Discover Artists" onPress={() => {}} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ARTISTS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ArtistCard item={item} />}
          contentContainerStyle={styles.horizontalList}
        />

        {/* Trending Now */}
        <SectionHeader title="Trending Now" onPress={() => {}} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TRENDING}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TrendingCard item={item} />}
          contentContainerStyle={styles.horizontalList}
        />

        {/* New Releases */}
        <SectionHeader title="New Releases" onPress={() => {}} />
        <View style={styles.releaseList}>
          {NEW_RELEASES.map((item) => (
            <ReleaseRow key={item.id} item={item} />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MC.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: MC.textSecondary,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 26,
    fontWeight: "700",
    color: MC.textPrimary,
    letterSpacing: -0.5,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MC.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
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
  searchIcon: {
    fontSize: 20,
    color: MC.textMuted,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: MC.textPrimary,
    padding: 0,
  },
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
  featuredText: {
    flex: 1,
    paddingRight: 16,
  },
  featuredName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  featuredTagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  featuredGenre: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 16,
  },
  playNowBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  playNowText: {
    color: "#0D0B0E",
    fontWeight: "700",
    fontSize: 13,
  },
  featuredAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredAvatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MC.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    color: MC.accent,
    fontWeight: "600",
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 28,
  },
  artistCard: {
    width: 82,
    alignItems: "center",
  },
  artistAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  artistInitials: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
  },
  artistName: {
    color: MC.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  artistGenre: {
    color: MC.textMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  trendingCard: {
    width: 136,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: MC.surface,
  },
  trendingTop: {
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  trendingRank: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -2,
  },
  trendingBottom: {
    padding: 12,
    gap: 2,
  },
  trendingTitle: {
    color: MC.textPrimary,
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 17,
  },
  trendingArtist: {
    color: MC.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  trendingPlays: {
    color: MC.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  releaseList: {
    paddingHorizontal: 20,
    gap: 4,
  },
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
  releaseInfo: {
    flex: 1,
  },
  releaseTitle: {
    color: MC.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  releaseArtist: {
    color: MC.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  releaseMeta: {
    color: MC.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  likeButton: {
    paddingLeft: 12,
  },
  likeIcon: {
    fontSize: 22,
    color: MC.textMuted,
  },
  likeIconActive: {
    color: MC.accent,
  },
});
