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
import ProfileHeader from './ProfileHeader';
import ProfileTabBar from './ProfileTabBar';
import ActivityTabContent from './ActivityTabContent';
import ActivityDetailSheet from './ActivityDetailSheet';
import EditAvatarPopup from './EditAvatarPopup';

// Fullscreen Takeover Profile screen expanding from behind the header avatar
export default function ProfileTakeover({ visible, onClose }) {
  const [activeTab, setActiveTab] = useState('activity');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editPopupVisible, setEditPopupVisible] = useState(false);
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
          duration: 240,
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

  // Handle hardware back button on Android
  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      if (selectedActivity) {
        setSelectedActivity(null);
        return true;
      }
      if (editPopupVisible) {
        setEditPopupVisible(false);
        return true;
      }
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, selectedActivity, editPopupVisible, onClose]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.88, 1]);
    const opacity = progress.value;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [40, 0]);
    const opacity = interpolate(progress.value, [0.2, 1], [0, 1]);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  if (!mounted) return null;

  return (
    <Reanimated.View style={[styles.takeoverOverlay, animatedContainerStyle]}>
      <ProfileHeader
        onClose={onClose}
        onEditPress={() => setEditPopupVisible(true)}
      />

      <Reanimated.View style={[styles.bodyContent, animatedContentStyle]}>
        <ProfileTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
        {activeTab === 'activity' && (
          <ActivityTabContent onSelectActivity={(act) => setSelectedActivity(act)} />
        )}
      </Reanimated.View>

      <EditAvatarPopup
        visible={editPopupVisible}
        onClose={() => setEditPopupVisible(false)}
      />

      <ActivityDetailSheet
        visible={!!selectedActivity}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  takeoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 50,
  },
  bodyContent: {
    flex: 1,
  },
});
