import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Reanimated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ProfileTabBar from './ProfileTabBar';
import ActivityTabContent from './ActivityTabContent';
import ActivityDetailSheet from './ActivityDetailSheet';

// Takeover background & content layer expanding from behind the persistent header
// No slide-up, pure radial/scale takeover transition under the single header
export default function ProfileTakeoverLayer({
  visible,
  headerHeight = 148,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('activity');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [mounted, setMounted] = useState(visible);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: 280,
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

  // Handle Android hardware back button
  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      if (selectedActivity) {
        setSelectedActivity(null);
        return true;
      }
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, selectedActivity, onClose]);

  const animatedTakeoverStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.85, 1]);
    const opacity = progress.value;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  if (!mounted) return null;

  return (
    <Reanimated.View style={[styles.layer, animatedTakeoverStyle]}>
      <View style={[styles.contentWrap, { paddingTop: headerHeight }]}>
        <ProfileTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
        {activeTab === 'activity' && (
          <ActivityTabContent
            onSelectActivity={(item) => setSelectedActivity(item)}
          />
        )}
      </View>

      <ActivityDetailSheet
        visible={!!selectedActivity}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 50,
  },
  contentWrap: {
    flex: 1,
  },
});
