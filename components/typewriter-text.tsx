import { MC } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextStyle, StyleProp } from "react-native";

type TypewriterTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  speed?: number;
  startDelay?: number;
  highlightWord?: string;
  highlightColor?: string;
};

export function TypewriterText({
  text,
  style,
  speed = 35,
  startDelay = 0,
  highlightWord,
  highlightColor = MC.paleYellow,
}: TypewriterTextProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setVisibleChars(0);
    let charIndex = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        charIndex += 1;
        setVisibleChars(charIndex);
        if (charIndex >= text.length) {
          clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [cursorOpacity]);

  const done = visibleChars >= text.length;
  const revealed = text.slice(0, visibleChars);

  const highlightStart = highlightWord ? text.indexOf(highlightWord) : -1;
  const highlightEnd = highlightStart >= 0 ? highlightStart + highlightWord!.length : -1;

  let body: React.ReactNode = revealed;
  if (highlightStart >= 0) {
    const before = revealed.slice(0, Math.min(visibleChars, highlightStart));
    const highlighted = revealed.slice(
      Math.min(visibleChars, highlightStart),
      Math.min(visibleChars, highlightEnd)
    );
    const after = revealed.slice(Math.min(visibleChars, highlightEnd));
    body = (
      <>
        {before}
        <Text style={{ color: highlightColor }}>{highlighted}</Text>
        {after}
      </>
    );
  }

  return (
    <Text style={style}>
      {body}
      <Animated.Text
        style={[
          styles.cursor,
          style,
          { opacity: done ? cursorOpacity : 1 },
        ]}
      >
        ▌
      </Animated.Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  cursor: { color: MC.accent },
});
