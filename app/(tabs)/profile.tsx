import { MC } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HISTORY = [
  {
    id: "1",
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    when: "2 hours ago",
    color: "#7A1E2A",
    initials: "KL",
  },
  {
    id: "2",
    title: "Snooze",
    artist: "SZA",
    when: "Yesterday",
    color: "#5E3E82",
    initials: "SZ",
  },
  {
    id: "3",
    title: "Starboy",
    artist: "The Weeknd",
    when: "Yesterday",
    color: "#825E3E",
    initials: "TW",
  },
  {
    id: "4",
    title: "Earfquake",
    artist: "Tyler, The Creator",
    when: "2 days ago",
    color: "#3E825E",
    initials: "TC",
  },
  {
    id: "5",
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    when: "2 days ago",
    color: "#823E5E",
    initials: "BE",
  },
  {
    id: "6",
    title: "Blinding Lights",
    artist: "The Weeknd",
    when: "3 days ago",
    color: "#825E3E",
    initials: "TW",
  },
  {
    id: "7",
    title: "Pink + White",
    artist: "Frank Ocean",
    when: "4 days ago",
    color: "#3E5E82",
    initials: "FO",
  },
];

const TOP_ARTISTS = [
  {
    id: "1",
    name: "The Weeknd",
    plays: "312 plays",
    color: "#825E3E",
    initials: "TW",
  },
  {
    id: "2",
    name: "Kendrick Lamar",
    plays: "247 plays",
    color: "#7A1E2A",
    initials: "KL",
  },
  {
    id: "3",
    name: "SZA",
    plays: "189 plays",
    color: "#5E3E82",
    initials: "SZ",
  },
];

const STATS = [
  { label: "Songs", value: "847" },
  { label: "Artists", value: "43" },
  { label: "Hours", value: "127" },
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HistoryRow({ item }: { item: (typeof HISTORY)[0] }) {
  return (
    <TouchableOpacity style={styles.historyRow} activeOpacity={0.75}>
      <View style={[styles.historyArt, { backgroundColor: item.color }]}>
        <Text style={styles.historyInitials}>{item.initials}</Text>
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyArtist}>{item.artist}</Text>
      </View>
      <Text style={styles.historyWhen}>{item.when}</Text>
    </TouchableOpacity>
  );
}

function TopArtistRow({
  item,
  rank,
}: {
  item: (typeof TOP_ARTISTS)[0];
  rank: number;
}) {
  return (
    <TouchableOpacity style={styles.topArtistRow} activeOpacity={0.75}>
      <Text style={styles.topArtistRank}>{rank}</Text>
      <View style={[styles.topArtistAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.topArtistInitials}>{item.initials}</Text>
      </View>
      <View style={styles.topArtistInfo}>
        <Text style={styles.topArtistName}>{item.name}</Text>
        <Text style={styles.topArtistPlays}>{item.plays}</Text>
      </View>
      <View style={styles.topArtistBar}>
        <View
          style={[
            styles.topArtistBarFill,
            { width: `${100 - (rank - 1) * 25}%` as any },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

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
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>KJ</Text>
          </View>
          <Text style={styles.profileName}>Kenneth</Text>
          <Text style={styles.profileHandle}>@kennethjonesstephen</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </View>

        {/* Top Artists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Artists This Month</Text>
          <View style={styles.card}>
            {TOP_ARTISTS.map((artist, index) => (
              <React.Fragment key={artist.id}>
                <TopArtistRow item={artist} rank={index + 1} />
                {index < TOP_ARTISTS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Listening History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listening History</Text>
          <View style={styles.card}>
            {HISTORY.map((item, index) => (
              <React.Fragment key={item.id}>
                <HistoryRow item={item} />
                {index < HISTORY.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: MC.textPrimary,
    letterSpacing: -0.5,
  },
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
  settingsBtnText: {
    fontSize: 16,
    color: MC.textSecondary,
  },
  profileSection: {
    alignItems: "center",
    paddingBottom: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: MC.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 3,
    borderColor: MC.accentLight,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 30,
    letterSpacing: -1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: MC.textPrimary,
    letterSpacing: -0.5,
  },
  profileHandle: {
    fontSize: 13,
    color: MC.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  memberBadge: {
    backgroundColor: MC.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: MC.border,
  },
  memberBadgeText: {
    color: MC.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 28,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: MC.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: MC.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: MC.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: MC.textMuted,
    marginTop: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
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
  divider: {
    height: 1,
    backgroundColor: MC.border,
    marginLeft: 66,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  historyArt: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyInitials: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    fontSize: 13,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    color: MC.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  historyArtist: {
    color: MC.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  historyWhen: {
    color: MC.textMuted,
    fontSize: 11,
  },
  topArtistRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  topArtistRank: {
    width: 22,
    fontSize: 14,
    fontWeight: "700",
    color: MC.textMuted,
    marginRight: 12,
  },
  topArtistAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topArtistInitials: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    fontSize: 13,
  },
  topArtistInfo: {
    flex: 1,
  },
  topArtistName: {
    color: MC.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  topArtistPlays: {
    color: MC.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  topArtistBar: {
    width: 60,
    height: 4,
    backgroundColor: MC.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  topArtistBarFill: {
    height: "100%",
    backgroundColor: MC.accent,
    borderRadius: 2,
  },
});
