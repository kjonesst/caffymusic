import { MC } from "@/constants/theme";
import { SpotifyTrack } from "@/services/spotify";
import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  track: SpotifyTrack;
  onClose: () => void;
};

export default function MiniPlayer({ track, onClose }: Props) {
  const embedUrl = `https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>
          {track.name}
          <Text style={styles.artist}>  {track.artists[0]?.name}</Text>
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 176,
    backgroundColor: MC.bg,
    borderTopWidth: 1,
    borderTopColor: MC.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  label: {
    flex: 1,
    color: MC.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
  artist: {
    color: MC.textSecondary,
    fontWeight: "400",
  },
  close: {
    fontSize: 14,
    color: MC.textMuted,
  },
  webview: {
    flex: 1,
    backgroundColor: MC.bg,
  },
});
