import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Fade over scrollable content: dark at the edge, fading to clear.
// True native gradient, one view, GPU-rendered. pointerEvents="none" so
// it never blocks scrolling or taps on messages underneath.
export default function TopFade({ height = 28, position = 'top' }) {
  const isBottom = position === 'bottom';
  return (
    <LinearGradient
      colors={isBottom ? ['rgba(0,0,0,0)', 'rgba(0,0,0,1)'] : ['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[isBottom ? styles.bottom : styles.top, { height }]}
      pointerEvents="none"
    />
  );
}

export function BottomFade({ height = 12 }) {
  return <TopFade height={height} position="bottom" />;
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
