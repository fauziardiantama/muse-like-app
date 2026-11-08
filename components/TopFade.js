import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Top fade over the chat area: dark at the very top, fading to clear.
// True native gradient, one view, GPU-rendered. pointerEvents="none" so
// it never blocks scrolling or taps on messages underneath.
export default function TopFade({ height = 28 }) {
  return (
    <LinearGradient
      colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.fade, { height }]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', top: 0, left: 0, right: 0 },
});
