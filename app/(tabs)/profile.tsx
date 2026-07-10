import { BottomFade } from "@/components/bottom-fade";
import { TAB_BAR_CLEARANCE } from "@/components/floating-tab-bar";
import { TypewriterText } from "@/components/typewriter-text";
import { MC } from "@/constants/theme";
import { useLocalTracks } from "@/context/local-tracks-context";
import { useSpotifyAuth } from "@/context/spotify-auth-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getMe,
  getPlaylists,
  getRecentlyPlayed,
  getSavedTracks,
  getTopArtists,
  getTopTracks,
  RecentlyPlayed,
  SpotifyArtist,
  SpotifyUser,
} from "@/services/spotify";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { File, Paths } from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ReanimatedAnimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { scheduleOnRN } from "react-native-worklets";

const TASTE_PROFILE_KEY = "caffy_taste_profile";
const TASTE_PROFILE_COUNT_KEY = "caffy_taste_profile_count";
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!;

const AVATAR_COLORS = [
  "#7A1E2A",
  "#5E3E82",
  "#3E5E82",
  "#3E825E",
  "#823E5E",
  "#825E3E",
  "#3E8282",
  "#6E5E3E",
];

function colorForIndex(i: number) {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
  const scale = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scale.setValue(1);
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.25,
        speed: 40,
        bounciness: 14,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 20,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  return (
    <View style={styles.statCard}>
      <Animated.Text style={[styles.statValue, { transform: [{ scale }] }]}>
        {value}
      </Animated.Text>
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
        <Text style={styles.topArtistGenre} numberOfLines={1}>
          {item.genres[0] ?? "Artist"}
        </Text>
      </View>
      <View style={styles.topArtistBar}>
        <View style={[styles.topArtistBarFill, { width: barWidth }]} />
      </View>
    </TouchableOpacity>
  );
}

function ShareButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.shareBtn}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator color={MC.textMuted} size="small" />
      ) : (
        <Ionicons name="share-outline" size={18} color={MC.textMuted} />
      )}
    </TouchableOpacity>
  );
}

function RegenButton({ onPress }: { onPress: () => void }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(200,150,91,0.35)", MC.accent],
  });
  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.4],
  });
  const shadowRadius = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 5],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.regenBtn,
          {
            borderColor,
            shadowColor: MC.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity,
            shadowRadius,
          },
        ]}
      >
        <Text style={styles.regenBtnText}>Recognise Me!</Text>
      </Animated.View>
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
        <View
          style={[styles.historyArt, { backgroundColor: colorForIndex(0) }]}
        >
          <Text style={styles.historyInitials}>
            {initials(item.track.name)}
          </Text>
        </View>
      )}
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={1}>
          {item.track.name}
        </Text>
        <Text style={styles.historyArtist} numberOfLines={1}>
          {item.track.artists[0]?.name}
        </Text>
      </View>
      <Text style={styles.historyWhen}>{timeAgo(item.played_at)}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { token } = useSpotifyAuth();
  const { tracks: localTracks } = useLocalTracks();
  const router = useRouter();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tasteProfile, setTasteProfile] = useState<{
    summary: string;
    analysis: string;
  } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [tasteCount, setTasteCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const tasteCardRef = useRef<View>(null);
  const [tasteCardExpanded, setTasteCardExpanded] = useState(false);
  const expandProgress = useSharedValue(0);
  const cardOrigin = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });

  const tasteCardTarget = {
    width: winWidth * 0.85,
    height: winHeight * 0.85,
    x: winWidth * 0.075,
    y: winHeight * 0.075,
  };

  const pullToCloseTriggered = useRef(false);
  const shareCardRef = useRef<View>(null);
  const [sharingImage, setSharingImage] = useState(false);

  function expandTasteCard() {
    tasteCardRef.current?.measureInWindow((x, y, width, height) => {
      cardOrigin.value = { x, y, width, height };
      setTasteCardExpanded(true);
      pullToCloseTriggered.current = false;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      expandProgress.value = withTiming(1, { duration: 380 });
    });
  }

  function collapseTasteCard() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    expandProgress.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) scheduleOnRN(setTasteCardExpanded, false);
    });
  }

  async function shareTasteProfile() {
    if (!tasteProfile || !shareCardRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSharingImage(true);
    try {
      const capturedUri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
      });
      const namedFile = new File(Paths.cache, "myCaffy Taste Profile.png");
      if (namedFile.exists) namedFile.delete();
      new File(capturedUri).copy(namedFile);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(namedFile.uri, {
          mimeType: "image/png",
          dialogTitle: "Share your Caffy taste profile",
        });
      }
    } catch {
      // user cancelled or capture/share failed — nothing to do
    } finally {
      setSharingImage(false);
    }
  }

  function handleTasteCardScroll(e: {
    nativeEvent: { contentOffset: { y: number } };
  }) {
    if (pullToCloseTriggered.current) return;
    if (e.nativeEvent.contentOffset.y < -70) {
      pullToCloseTriggered.current = true;
      collapseTasteCard();
    }
  }

  const tasteCardOverlayStyle = useAnimatedStyle(() => {
    const x = interpolate(
      expandProgress.value,
      [0, 1],
      [cardOrigin.value.x, tasteCardTarget.x],
    );
    const y = interpolate(
      expandProgress.value,
      [0, 1],
      [cardOrigin.value.y, tasteCardTarget.y],
    );
    const width = interpolate(
      expandProgress.value,
      [0, 1],
      [cardOrigin.value.width, tasteCardTarget.width],
    );
    const height = interpolate(
      expandProgress.value,
      [0, 1],
      [cardOrigin.value.height, tasteCardTarget.height],
    );
    const borderRadius = interpolate(expandProgress.value, [0, 1], [16, 24]);
    return {
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      borderRadius,
    };
  });

  const tasteCardBackdropStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
  }));

  const tasteCardContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.5, 1], [0, 1], "clamp"),
  }));

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getMe(token),
      getTopArtists(token, 3),
      getRecentlyPlayed(token),
      getSavedTracks(token, 50),
      getPlaylists(token, 50),
    ])
      .then(([me, artists, recent, saved, playlists]) => {
        setUser(me);
        setTopArtists(artists);
        setRecentlyPlayed(recent);
        setSavedCount(saved.length);
        setPlaylistCount(playlists.length);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    AsyncStorage.getItem(TASTE_PROFILE_KEY).then((raw) => {
      if (!raw) return;
      try {
        setTasteProfile(JSON.parse(raw));
      } catch {
        // stale plain-string cache — discard it
        AsyncStorage.removeItem(TASTE_PROFILE_KEY);
      }
    });
    AsyncStorage.getItem(TASTE_PROFILE_COUNT_KEY).then((raw) => {
      const count = parseInt(raw ?? "0", 10);
      setTasteCount(Number.isNaN(count) ? 0 : count);
    });
  }, []);

  function fireGenerateHaptics() {
    [0, 120, 240, 360].forEach((delay) => {
      setTimeout(
        () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
        delay,
      );
    });
  }

  async function generateProfile() {
    if (!token) return;
    setGenerating(true);
    setGenError(null);
    setTasteProfile(null);
    fireGenerateHaptics();
    try {
      const [topArtistsFull, topTracks, savedTracks] = await Promise.all([
        getTopArtists(token, 10),
        getTopTracks(token, 10),
        getSavedTracks(token, 30),
      ]);

      const artistLines = topArtistsFull
        .map(
          (a) =>
            `${a.name} (${a.genres.slice(0, 3).join(", ") || "unknown genre"})`,
        )
        .join("\n");

      const trackLines = topTracks
        .map(
          (t) =>
            `${t.name} by ${t.artists.map((a) => a.name).join(", ")} (popularity ${t.popularity})`,
        )
        .join("\n");

      const savedLines = savedTracks
        .slice(0, 20)
        .map(
          (s) =>
            `${s.track.name} by ${s.track.artists.map((a) => a.name).join(", ")}`,
        )
        .join("\n");

      const localLines = localTracks.map((t) => t.name).join("\n");

      const prompt = `You are a music taste analyst with a deep knowledge of genres, subcultures, and listening patterns. Based on the following data about a listener's music habits, write a vivid, insightful, personal description of their music taste. Be specific, reference actual artists and genres mentioned, and avoid generic statements. Write 2–3 paragraphs in second person ("You..."). Make it feel like a bespoke profile, not a template.

TOP ARTISTS (this month):
${artistLines}

TOP TRACKS (recent):
${trackLines}

SAVED TRACKS (sample):
${savedLines}

${localLines ? `LOCAL FILES ON DEVICE:\n${localLines}` : ""}

Respond in exactly this structure:

SUMMARY: [One punchy sentence that captures the essence of their taste — like a headline for their musical identity.]

ANALYSIS:
[2–3 paragraphs in second person ("You…") going deeper — reference specific artists, genres, and patterns. Be vivid and specific, not generic.]`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as any)?.error?.message ?? `API error ${res.status}`,
        );
      }

      const data = await res.json();
      const raw =
        data?.content?.find((b: any) => b.type === "text")?.text ?? "";
      if (!raw) throw new Error("No response from Claude.");

      const summaryMatch = raw.match(/SUMMARY:\s*(.+?)(?:\n|$)/s);
      const analysisMatch = raw.match(/ANALYSIS:\s*([\s\S]+)/);
      const profile = {
        summary: summaryMatch?.[1]?.trim() ?? "",
        analysis: analysisMatch?.[1]?.trim() ?? raw.trim(),
      };

      setTasteProfile(profile);
      await AsyncStorage.setItem(TASTE_PROFILE_KEY, JSON.stringify(profile));

      const newCount = tasteCount + 1;
      setTasteCount(newCount);
      await AsyncStorage.setItem(TASTE_PROFILE_COUNT_KEY, String(newCount));
    } catch (e: any) {
      setGenError(e?.message ?? "Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }

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
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!tasteCardExpanded}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Your <Text style={styles.headerTitleAccent}>Caffy</Text> Profile,
          </Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
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
          <StatCard label="Tastes" value={String(tasteCount)} />
        </View>

        {/* AI Taste Profile */}
        <View style={styles.section}>
          <TypewriterText
            text="Let us analyse your music library and figure your caffinated taste in music."
            style={styles.typewriterIntro}
            highlightWord="caffinated"
          />
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your Music Taste:</Text>
            {tasteProfile && !generating && (
              <View style={styles.sectionHeaderActions}>
                <ShareButton
                  onPress={shareTasteProfile}
                  loading={sharingImage}
                />
                <RegenButton onPress={generateProfile} />
              </View>
            )}
          </View>

          {!tasteProfile && !generating && !genError && (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={generateProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.generateBtnIcon}>✦</Text>
              <Text style={styles.generateBtnText}>
                Generate My Taste Profile
              </Text>
            </TouchableOpacity>
          )}

          {generating && (
            <View style={[styles.card, styles.profileCard]}>
              <View style={styles.profileLoading}>
                <ActivityIndicator color={MC.accent} size="small" />
                <Text style={styles.profileLoadingText}>
                  Analysing your listening…
                </Text>
              </View>
            </View>
          )}

          {tasteProfile && !generating && (
            <View
              ref={tasteCardRef}
              collapsable={false}
              style={{ opacity: tasteCardExpanded ? 0 : 1 }}
            >
              <TouchableOpacity
                style={[styles.card, styles.profileCard]}
                activeOpacity={0.9}
                onPress={expandTasteCard}
              >
                {tasteProfile.summary ? (
                  <>
                    <TypewriterText
                      text={tasteProfile.summary}
                      style={styles.profileSummary}
                      speed={30}
                    />
                    {tasteProfile.analysis ? (
                      <View style={styles.profileDivider} />
                    ) : null}
                  </>
                ) : null}
                {tasteProfile.analysis ? (
                  <TypewriterText
                    text={tasteProfile.analysis}
                    style={styles.profileText}
                    speed={12}
                    startDelay={
                      tasteProfile.summary
                        ? tasteProfile.summary.length * 30 + 300
                        : 0
                    }
                  />
                ) : null}
              </TouchableOpacity>
            </View>
          )}

          {genError && !generating && (
            <View style={[styles.card, styles.profileCard]}>
              <Text style={styles.profileError}>{genError}</Text>
              <TouchableOpacity
                onPress={generateProfile}
                style={styles.retryBtn}
              >
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Artists This Month</Text>
            <View style={styles.card}>
              {topArtists.map((artist, index) => (
                <React.Fragment key={artist.id}>
                  <TopArtistRow item={artist} index={index} />
                  {index < topArtists.length - 1 && (
                    <View style={styles.divider} />
                  )}
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
                  {index < recentlyPlayed.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 24 + TAB_BAR_CLEARANCE }} />
      </ScrollView>

      {tasteCardExpanded && tasteProfile && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={collapseTasteCard}
          >
            <ReanimatedAnimated.View
              style={[StyleSheet.absoluteFill, tasteCardBackdropStyle]}
              pointerEvents="none"
            >
              <BlurView
                intensity={45}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.tasteCardBackdropDim} />
            </ReanimatedAnimated.View>
          </Pressable>

          <ReanimatedAnimated.View
            style={[styles.tasteCardExpandedCard, tasteCardOverlayStyle]}
          >
            <ReanimatedAnimated.View
              style={[styles.tasteCardExpandedInner, tasteCardContentStyle]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces
                overScrollMode="always"
                scrollEventThrottle={16}
                onScroll={handleTasteCardScroll}
              >
                {tasteProfile.summary ? (
                  <Text style={styles.tasteCardExpandedSummary}>
                    {tasteProfile.summary}
                  </Text>
                ) : null}
                {tasteProfile.analysis ? (
                  <>
                    <View style={styles.profileDivider} />
                    <Text style={styles.tasteCardExpandedAnalysis}>
                      {tasteProfile.analysis}
                    </Text>
                  </>
                ) : null}
              </ScrollView>
              <TouchableOpacity
                style={styles.tasteCardCloseBtn}
                onPress={collapseTasteCard}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.tasteCardCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </ReanimatedAnimated.View>
          </ReanimatedAnimated.View>
        </>
      )}

      {tasteProfile && (
        <View style={styles.shareCardHidden} pointerEvents="none">
          <View ref={shareCardRef} collapsable={false} style={styles.shareCard}>
            <View style={styles.shareCardBrandRow}>
              <Text style={styles.shareCardBrandText}>
                ☕ Music Taste Caffinated...
              </Text>
            </View>
            {tasteProfile.summary ? (
              <Text style={styles.shareCardSummary}>
                {tasteProfile.summary}
              </Text>
            ) : null}
            <View style={styles.shareCardFooterDivider} />
            <Text style={styles.shareCardWatermark}>Made with Caffy</Text>
          </View>
        </View>
      )}
      <BottomFade />
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
  headerTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: MC.textPrimary,
    letterSpacing: -0.5,
  },
  headerTitleAccent: {
    color: MC.accent,
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
  settingsBtnText: { fontSize: 16, color: MC.textSecondary },
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
  section: { marginHorizontal: 20, marginBottom: 24 },
  typewriterIntro: {
    fontSize: 27,
    fontWeight: "600",
    color: MC.textSecondary,
    letterSpacing: -0.1,
    marginBottom: 14,
    fontStyle: "italic",
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
  divider: { height: 1, backgroundColor: MC.border, marginLeft: 66 },
  topArtistRow: { flexDirection: "row", alignItems: "center", padding: 14 },
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
    overflow: "hidden",
  },
  topArtistInitials: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    fontSize: 13,
  },
  topArtistInfo: { flex: 1 },
  topArtistName: { color: MC.textPrimary, fontWeight: "600", fontSize: 14 },
  topArtistGenre: { color: MC.textMuted, fontSize: 11, marginTop: 2 },
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
  historyInitials: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    fontSize: 13,
  },
  historyInfo: { flex: 1 },
  historyTitle: { color: MC.textPrimary, fontWeight: "600", fontSize: 14 },
  historyArtist: { color: MC.textSecondary, fontSize: 12, marginTop: 2 },
  historyWhen: { color: MC.textMuted, fontSize: 11 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shareBtn: {
    padding: 4,
  },
  regenBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MC.accent,
    backgroundColor: MC.bg,
  },
  regenBtnText: { color: MC.textMuted, fontSize: 11, fontWeight: "600" },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MC.accent,
    backgroundColor: MC.surface,
  },
  generateBtnIcon: { fontSize: 18, color: MC.accent },
  generateBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: MC.accent,
    letterSpacing: -0.2,
  },
  profileCard: { padding: 18 },
  profileSummary: {
    color: MC.accent,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  profileDivider: { height: 1, backgroundColor: MC.border, marginVertical: 14 },
  profileText: {
    color: MC.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  profileLoading: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileLoadingText: {
    color: MC.textMuted,
    fontSize: 13,
    fontStyle: "italic",
  },
  profileError: { color: "#E57373", fontSize: 13, marginBottom: 12 },
  retryBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: MC.surface,
    borderWidth: 1,
    borderColor: MC.border,
  },
  retryBtnText: { color: MC.textSecondary, fontSize: 12, fontWeight: "600" },
  tasteCardBackdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tasteCardExpandedCard: {
    backgroundColor: MC.surface,
    borderWidth: 1,
    borderColor: MC.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  tasteCardExpandedInner: { flex: 1, padding: 22 },
  tasteCardExpandedSummary: {
    color: MC.accent,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  tasteCardExpandedAnalysis: {
    color: MC.textPrimary,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  tasteCardCloseBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MC.bg,
    borderWidth: 1,
    borderColor: MC.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tasteCardCloseBtnText: {
    color: MC.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  shareCardHidden: {
    position: "absolute",
    top: 0,
    left: -3000,
  },
  shareCard: {
    width: 340,
    padding: 28,
    backgroundColor: MC.bg,
    borderWidth: 1,
    borderColor: MC.border,
  },
  shareCardBrandRow: { marginBottom: 24 },
  shareCardBrandText: {
    color: MC.accent,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 3,
  },
  shareCardSummary: {
    color: MC.accent,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  shareCardFooterDivider: {
    height: 1,
    backgroundColor: MC.border,
    marginTop: 24,
    marginBottom: 12,
  },
  shareCardWatermark: {
    color: MC.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "right",
  },
});
