import { MC } from "@/constants/theme";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FAVORITES = [
  {
    id: "1",
    title: "Not Us",
    artist: " Lamar",
    duration: "4:34",
    color: "#7A1E2A",
    initials: "KL",
  },
  {
    id: "2",
    title: "Snooze",
    artist: "SZA",
    duration: "3:52",
    color: "#5E3E82",
    initials: "SZ",
  },
  {
    id: "3",
    title: "Blinding Lights",
    artist: "The Weeknd",
    duration: "3:20",
    color: "#825E3E",
    initials: "TW",
  },
  {
    id: "4",
    title: "Earfquake",
    artist: "Tyler, The Creator",
    duration: "3:22",
    color: "#3E825E",
    initials: "TC",
  },
  {
    id: "5",
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    duration: "3:21",
    color: "#823E5E",
    initials: "BE",
  },
  {
    id: "6",
    title: "Pink + White",
    artist: "Frank Ocean",
    duration: "3:02",
    color: "#3E5E82",
    initials: "FO",
  },
  {
    id: "7",
    title: "Need Me",
    artist: "Doja Cat",
    duration: "3:10",
    color: "#3E8282",
    initials: "DC",
  },
];

const DOWNLOADS = [
  {
    id: "1",
    title: "Humble.",
    artist: "Kendrick Lamar",
    duration: "2:57",
    color: "#7A1E2A",
    initials: "KL",
  },
  {
    id: "2",
    title: "Good Days",
    artist: "SZA",
    duration: "4:40",
    color: "#5E3E82",
    initials: "SZ",
  },
  {
    id: "3",
    title: "Starboy",
    artist: "The Weeknd",
    duration: "3:50",
    color: "#825E3E",
    initials: "TW",
  },
  {
    id: "4",
    title: "See You Again",
    artist: "Tyler, The Creator",
    duration: "3:31",
    color: "#3E825E",
    initials: "TC",
  },
  {
    id: "5",
    title: "Happier Than Ever",
    artist: "Billie Eilish",
    duration: "4:58",
    color: "#823E5E",
    initials: "BE",
  },
];

const PLAYLISTS = [
  {
    id: "p1",
    title: "Late Night Vibes",
    count: "14 songs",
    color: "#3E5E82",
    initials: "LN",
  },
  {
    id: "p2",
    title: "Morning Boost",
    count: "9 songs",
    color: "#5E3E82",
    initials: "MB",
  },
  {
    id: "p3",
    title: "Focus Mode",
    count: "21 songs",
    color: "#3E825E",
    initials: "FM",
  },
];

type Tab = "favorites" | "downloads" | "playlists";

function SongRow({
  item,
  showDownloadBadge,
}: {
  item: (typeof FAVORITES)[0];
  showDownloadBadge?: boolean;
}) {
  const [liked, setLiked] = useState(showDownloadBadge ? false : true);

  return (
    <TouchableOpacity style={styles.songRow} activeOpacity={0.75}>
      <View style={[styles.songArt, { backgroundColor: item.color }]}>
        <Text style={styles.songInitials}>{item.initials}</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
      <Text style={styles.songDuration}>{item.duration}</Text>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => setLiked(!liked)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.actionIcon, liked && styles.actionIconActive]}>
          {showDownloadBadge ? "↓" : liked ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function PlaylistRow({ item }: { item: (typeof PLAYLISTS)[0] }) {
  return (
    <TouchableOpacity style={styles.songRow} activeOpacity={0.75}>
      <View style={[styles.songArt, { backgroundColor: item.color }]}>
        <Text style={styles.songInitials}>{item.initials}</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.count}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("favorites");

  const tabs: { key: Tab; label: string }[] = [
    { key: "favorites", label: "Favorites" },
    { key: "downloads", label: "Downloads" },
    { key: "playlists", label: "Playlists" },
  ];

  const renderContent = () => {
    if (activeTab === "favorites") {
      return (
        <FlatList
          data={FAVORITES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SongRow item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      );
    }
    if (activeTab === "downloads") {
      return (
        <FlatList
          data={DOWNLOADS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SongRow item={item} showDownloadBadge />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      );
    }
    return (
      <FlatList
        data={PLAYLISTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaylistRow item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  const counts = {
    favorites: FAVORITES.length,
    downloads: DOWNLOADS.length,
    playlists: PLAYLISTS.length,
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
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <Text style={styles.countText}>
        {counts[activeTab]} {activeTab === "playlists" ? "playlists" : "songs"}
      </Text>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MC.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: MC.textPrimary,
    letterSpacing: -0.5,
  },
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
  addBtnText: {
    color: MC.accent,
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 26,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: MC.border,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 14,
    position: "relative",
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: MC.textMuted,
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: MC.textPrimary,
  },
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
    paddingBottom: 20,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: MC.border,
  },
  songArt: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  songInitials: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    fontSize: 15,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: MC.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  songArtist: {
    color: MC.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  songDuration: {
    color: MC.textMuted,
    fontSize: 12,
    marginRight: 14,
  },
  actionBtn: {
    paddingLeft: 4,
  },
  actionIcon: {
    fontSize: 20,
    color: MC.textMuted,
  },
  actionIconActive: {
    color: MC.accent,
  },
  chevron: {
    color: MC.textMuted,
    fontSize: 24,
    fontWeight: "300",
  },
});
