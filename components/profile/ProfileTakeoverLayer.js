import { useEffect } from 'react';
import { BackHandler, Dimensions, StyleSheet } from 'react-native';
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
// Uses mathematical pivot translation relative to view center to radiate outwards from the avatar
// without relying on fragile or crash-inducing transformOrigin properties.
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_PIVOT_Y = 64; // Vertical center behind header avatar
const TRANSLATE_Y_OFFSET = AVATAR_PIVOT_Y - SCREEN_HEIGHT / 2;

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
    const scale = interpolate(progress.value, [0, 1], [0.05, 1], Extrapolation.CLAMP);
    const opacity = interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    const translateY = (1 - scale) * TRANSLATE_Y_OFFSET;

    return {
      opacity,
      transform: [
        { translateY },
        { scale },
      ],
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    zIndex: 50,
    elevation: 20,
  },
});
