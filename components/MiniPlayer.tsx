import { MC } from "@/constants/theme";
import { SpotifyTrack } from "@/services/spotify";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  track: SpotifyTrack;
  onClose: () => void;
};

export default function MiniPlayer({ track, onClose }: Props) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (track.preview_url) {
      player.replace({ uri: track.preview_url });
      player.play();
    }
  }, [track.id]);

  const isPlaying = status.playing;
  const progress =
    status.duration > 0 ? status.currentTime / status.duration : 0;

  function togglePlay() {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }

  const albumArt = track.album.images[0]?.url;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.row}>
        {albumArt ? (
          <Image source={{ uri: albumArt }} style={styles.art} />
        ) : (
          <View style={[styles.art, styles.artFallback]} />
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artists[0]?.name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={togglePlay}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: MC.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: MC.border,
  },
  progressBar: {
    height: 2,
    backgroundColor: MC.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: MC.accent,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  artFallback: {
    backgroundColor: MC.surface,
  },
  info: {
    flex: 1,
  },
  title: {
    color: MC.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  artist: {
    color: MC.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  playBtn: {},
  playIcon: {
    fontSize: 22,
    color: MC.accent,
  },
  closeBtn: {},
  closeIcon: {
    fontSize: 14,
    color: MC.textMuted,
  },
});
