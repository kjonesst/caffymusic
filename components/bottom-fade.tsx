import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View } from "react-native";

const BANDS = [
  { height: 40, intensity: 5 },
  { height: 20, intensity: 20 },
  { height: 10, intensity: 38 },
  { height: 5, intensity: 60 },
];

export function BottomFade() {
  return (
    <View style={styles.container} pointerEvents="none">
      {BANDS.map((band) => (
        <BlurView
          key={band.height}
          intensity={band.intensity}
          tint="dark"
          style={[styles.band, { height: band.height }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  band: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
