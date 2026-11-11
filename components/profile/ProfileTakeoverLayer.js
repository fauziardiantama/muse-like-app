import { useEffect } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import Reanimated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Pure blank black takeover layer expanding from behind the avatar
// Always mounted in render tree to eliminate React/Reanimated mount race conditions.
// Covers entire chat, composer, and tab bar smoothly without any slide-up.
export default function ProfileTakeoverLayer({ visible, onClose }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 300 : 220,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [visible, progress]);

  // Handle Android back button to close profile
  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, onClose]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.8, 1], Extrapolation.CLAMP);
    const opacity = interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Reanimated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.takeoverLayer, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  takeoverLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 50,
    elevation: 20,
  },
});
