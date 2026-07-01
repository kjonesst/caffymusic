import { useSpotifyAuth } from "@/context/spotify-auth-context";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MC } from "@/constants/theme";

type RowProps =
  | { type: "toggle"; label: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void }
  | { type: "selector"; label: string; subtitle?: string; value: string; onPress: () => void }
  | { type: "nav"; label: string; subtitle?: string; onPress: () => void; destructive?: boolean }
  | { type: "info"; label: string; value: string };

function SettingRow(props: RowProps) {
  const isDestructive = props.type === "nav" && props.destructive;

  const content = (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, isDestructive && styles.rowLabelDestructive]}>
          {props.label}
        </Text>
        {props.type !== "info" && props.subtitle ? (
          <Text style={styles.rowSubtitle}>{props.subtitle}</Text>
        ) : null}
      </View>
      {props.type === "toggle" && (
        <Switch
          value={props.value}
          onValueChange={props.onChange}
          thumbColor={props.value ? MC.accent : MC.textMuted}
          trackColor={{ false: MC.border, true: `${MC.accent}55` }}
        />
      )}
      {props.type === "selector" && (
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{props.value}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      )}
      {props.type === "nav" && <Text style={styles.chevron}>›</Text>}
      {props.type === "info" && <Text style={styles.rowValue}>{props.value}</Text>}
    </View>
  );

  if (props.type === "toggle" || props.type === "info") {
    return content;
  }

  return (
    <TouchableOpacity onPress={props.onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const QUALITY_OPTIONS = ["Low (24 kbps)", "Normal (96 kbps)", "High (160 kbps)", "Very High (320 kbps)"];
const DOWNLOAD_OPTIONS = ["Normal (96 kbps)", "High (160 kbps)", "Very High (320 kbps)"];

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useSpotifyAuth();
  const [streamingQuality, setStreamingQuality] = useState("High (160 kbps)");
  const [downloadQuality, setDownloadQuality] = useState("High (160 kbps)");
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [crossfade, setCrossfade] = useState(false);
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [equalizerEnabled, setEqualizerEnabled] = useState(false);
  const [newReleases, setNewReleases] = useState(true);
  const [recommendations, setRecommendations] = useState(true);
  const [playbackNotifs, setPlaybackNotifs] = useState(false);
  const [privateSession, setPrivateSession] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);

  function cycleOption(options: string[], current: string, setter: (v: string) => void) {
    const next = options[(options.indexOf(current) + 1) % options.length];
    setter(next);
  }

  function showAlert(title: string, message: string) {
    Alert.alert(title, message, [{ text: "OK" }]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={MC.bg} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account */}
        <Section title="Account">
          <SettingRow
            type="nav"
            label="Kenneth"
            subtitle="kennethjonesstephen@gmail.com"
            onPress={() => showAlert("Account", "Account management coming soon.")}
          />
          <Divider />
          <SettingRow
            type="nav"
            label="Connected Accounts"
            subtitle="Spotify, Apple Music"
            onPress={() => showAlert("Connected Accounts", "Account linking coming soon.")}
          />
        </Section>

        {/* Audio & Playback */}
        <Section title="Audio & Playback">
          <SettingRow
            type="selector"
            label="Streaming Quality"
            subtitle="Affects data usage"
            value={streamingQuality}
            onPress={() => cycleOption(QUALITY_OPTIONS, streamingQuality, setStreamingQuality)}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Normalize Volume"
            subtitle="Keep volume consistent across songs"
            value={normalizeVolume}
            onChange={setNormalizeVolume}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Crossfade"
            subtitle="Smooth transition between songs"
            value={crossfade}
            onChange={setCrossfade}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Equalizer"
            subtitle="Manually adjust audio frequencies"
            value={equalizerEnabled}
            onChange={setEqualizerEnabled}
          />
          <Divider />
          <SettingRow
            type="nav"
            label="Playback Speed"
            onPress={() => showAlert("Playback Speed", "Speed controls coming soon.")}
          />
        </Section>

        {/* Downloads */}
        <Section title="Downloads">
          <SettingRow
            type="selector"
            label="Download Quality"
            value={downloadQuality}
            onPress={() => cycleOption(DOWNLOAD_OPTIONS, downloadQuality, setDownloadQuality)}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Download on Wi-Fi Only"
            subtitle="Avoid mobile data usage"
            value={wifiOnly}
            onChange={setWifiOnly}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Auto-Download Liked Songs"
            value={autoDownload}
            onChange={setAutoDownload}
          />
          <Divider />
          <SettingRow
            type="nav"
            label="Manage Storage"
            subtitle="Downloads use 0 MB"
            onPress={() => showAlert("Storage", "Storage management coming soon.")}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow
            type="toggle"
            label="New Releases"
            subtitle="From artists you follow"
            value={newReleases}
            onChange={setNewReleases}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Recommendations"
            subtitle="Personalised song suggestions"
            value={recommendations}
            onChange={setRecommendations}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Playback Controls in Notifications"
            value={playbackNotifs}
            onChange={setPlaybackNotifs}
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy & Data">
          <SettingRow
            type="toggle"
            label="Private Session"
            subtitle="Activity won't appear in history"
            value={privateSession}
            onChange={setPrivateSession}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Save Listening History"
            value={saveHistory}
            onChange={setSaveHistory}
          />
          <Divider />
          <SettingRow
            type="toggle"
            label="Share Data for Improvements"
            subtitle="Helps us improve recommendations"
            value={dataSharing}
            onChange={setDataSharing}
          />
          <Divider />
          <SettingRow
            type="nav"
            label="Clear Listening History"
            onPress={() =>
              Alert.alert(
                "Clear History",
                "This will permanently delete your listening history.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: () => {} },
                ]
              )
            }
            destructive
          />
        </Section>

        {/* About */}
        <Section title="About">
          <SettingRow type="info" label="Caffy" value="v1.0.0" />
          <Divider />
          <SettingRow
            type="nav"
            label="Terms of Service"
            onPress={() => showAlert("Terms of Service", "Terms coming soon.")}
          />
          <Divider />
          <SettingRow
            type="nav"
            label="Privacy Policy"
            onPress={() => showAlert("Privacy Policy", "Privacy policy coming soon.")}
          />
          <Divider />
          <SettingRow
            type="nav"
            label="Open Source Licences"
            onPress={() => showAlert("Licences", "Licence information coming soon.")}
          />
        </Section>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <SettingRow
              type="nav"
              label="Sign Out"
              onPress={() =>
                Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign Out", style: "destructive", onPress: logout },
                ])
              }
              destructive
            />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
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
  backBtnText: {
    color: MC.textPrimary,
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 28,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: MC.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: MC.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: MC.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MC.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: MC.textPrimary,
  },
  rowLabelDestructive: {
    color: "#E05252",
  },
  rowSubtitle: {
    fontSize: 12,
    color: MC.textMuted,
    marginTop: 3,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 13,
    color: MC.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: MC.textMuted,
    fontWeight: "300",
  },
  divider: {
    height: 1,
    backgroundColor: MC.border,
    marginLeft: 16,
  },
});
