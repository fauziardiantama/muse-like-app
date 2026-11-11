import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import Reanimated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Pure blank black takeover layer expanding from behind the avatar
// Covers entire chat, composer, and tab bar without any slide-up
export default function ProfileTakeoverLayer({ visible, onClose }) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else if (mounted) {
      progress.value = withTiming(
        0,
        {
          duration: 220,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(setMounted)(false);
          }
        },
      );
    }
  }, [visible, mounted, progress]);

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
    const scale = interpolate(progress.value, [0, 1], [0.8, 1]);
    const opacity = progress.value;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  if (!mounted) return null;

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
    elevation: 15,
  },
});
