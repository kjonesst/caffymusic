import { MC } from "@/constants/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HIGHLIGHT_WIDTH = 60;
const HIGHLIGHT_HEIGHT = 48;

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const tabCount = state.routes.length;
  const tabWidth = barWidth / tabCount;

  const highlightX = useRef(new Animated.Value(0)).current;
  const iconScales = useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1.15 : 1)),
  ).current;

  useEffect(() => {
    if (!barWidth) return;
    const target = state.index * tabWidth + tabWidth / 2 - HIGHLIGHT_WIDTH / 2;
    Animated.spring(highlightX, {
      toValue: target,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();

    iconScales.forEach((scale, i) => {
      Animated.spring(scale, {
        toValue: i === state.index ? 1.15 : 1,
        useNativeDriver: true,
        speed: 24,
        bounciness: i === state.index ? 14 : 0,
      }).start();
    });
  }, [state.index, barWidth]);

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.shadowWrap}>
        <View style={styles.bar} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.barTint} pointerEvents="none" />

          {barWidth > 0 && (
            <Animated.View
              style={[
                styles.highlight,
                { transform: [{ translateX: highlightX }] },
              ]}
            />
          )}

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label = options.title ?? route.name;
            const color = isFocused ? MC.accent : MC.textMuted;

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={label}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={{ transform: [{ scale: iconScales[index] }] }}
                >
                  {options.tabBarIcon?.({ focused: isFocused, color, size: 23 })}
                </Animated.View>
                <Text style={[styles.label, { color }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  shadowWrap: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  bar: {
    flexDirection: "row",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: MC.border,
    backgroundColor: MC.surface,
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${MC.bg}66`,
  },
  highlight: {
    position: "absolute",
    top: 6,
    left: 0,
    width: HIGHLIGHT_WIDTH,
    height: HIGHLIGHT_HEIGHT,
    borderRadius: 18,
    backgroundColor: `${MC.accent}22`,
    borderWidth: 1,
    borderColor: `${MC.accent}44`,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
