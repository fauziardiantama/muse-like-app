import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

// 7 — AI typing: three dots pulsing in sequence, left to right, on a
// loop. One shared clock drives all three dots, so they can never drift
// apart over time (the old version ran three independent loops). Peaks
// are separated: dot 1 peaks at 0.30, dot 2 at 0.50, dot 3 at 0.70 of the
// 1.2s cycle, each pulse only 0.30 wide, so two dots are never big at
// the same time — only one dot is prominent at once, the others small.
export default function TypingIndicator() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 1200, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const dotStyle = (inputRange) => ({
    transform: [
      { scale: progress.interpolate({ inputRange, outputRange: [1, 1, 1.35, 1, 1] }) },
      { translateY: progress.interpolate({ inputRange, outputRange: [0, 0, -2, 0, 0] }) },
    ],
    opacity: progress.interpolate({ inputRange, outputRange: [0.5, 0.5, 1, 0.5, 0.5] }),
  });

  return (
    <View style={styles.bubble}>
      <Animated.View style={[styles.dot, dotStyle([0, 0.15, 0.3, 0.45, 1])]} />
      <Animated.View style={[styles.dot, dotStyle([0, 0.35, 0.5, 0.65, 1])]} />
      <Animated.View style={[styles.dot, dotStyle([0, 0.55, 0.7, 0.85, 1])]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { alignSelf: 'flex-start', backgroundColor: '#262626', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#888', marginHorizontal: 3 },
});
