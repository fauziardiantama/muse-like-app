import { useEffect, useState } from 'react';
import { BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import Reanimated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ProfileTabBar from './ProfileTabBar';
import ActivityTabContent from './ActivityTabContent';
import ActivityDetailSheet from './ActivityDetailSheet';
import Icon from '../Icon';

// Authentic Meta Muse profile takeover layer expanding from behind the avatar
// Always mounted in render tree to eliminate React/Reanimated mount race conditions.
// Uses mathematical pivot translation relative to view center to radiate outwards from the avatar
// without relying on fragile or crash-inducing transformOrigin properties.
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_PIVOT_Y = 64; // Vertical center behind header avatar
const TRANSLATE_Y_OFFSET = AVATAR_PIVOT_Y - SCREEN_HEIGHT / 2;

export default function ProfileTakeoverLayer({ visible, onClose, headerHeight = 160 }) {
  const [activeTab, setActiveTab] = useState('activity');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 300 : 220,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [visible, progress]);

  // Handle Android back button to close modal or profile
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

  const animatedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.35, 1], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <Reanimated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.takeoverLayer, animatedStyle]}>
      <Reanimated.View style={[styles.contentWrapper, { paddingTop: headerHeight }, animatedContentStyle]}>
        <ProfileTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
        {activeTab === 'activity' && (
          <ActivityTabContent onSelectActivity={(act) => setSelectedActivity(act)} />
        )}
        {activeTab === 'tasks' && (
          <View style={styles.emptyTab}>
            <Icon name="shield" size={36} color="#48484a" />
            <Text style={styles.emptyTitle}>Tugas & Jadwal</Text>
            <Text style={styles.emptySubtitle}>Belum ada tugas terjadwal untuk asisten.</Text>
          </View>
        )}
        {activeTab === 'display' && (
          <View style={styles.emptyTab}>
            <Icon name="tv" size={36} color="#48484a" />
            <Text style={styles.emptyTitle}>Desktop</Text>
            <Text style={styles.emptySubtitle}>Desktop isn't available right now</Text>
          </View>
        )}
        {activeTab === 'history' && (
          <View style={styles.emptyTab}>
            <Icon name="clock" size={36} color="#48484a" />
            <Text style={styles.emptyTitle}>Riwayat</Text>
            <Text style={styles.emptySubtitle}>Riwayat eksekusi dan memori tersimpan.</Text>
          </View>
        )}
      </Reanimated.View>

      <ActivityDetailSheet
        visible={!!selectedActivity}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </Reanimated.View>
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
  contentWrapper: {
    flex: 1,
  },
  emptyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: 'OptimisticApp-Bold',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#8e8e93',
    fontSize: 14,
    fontFamily: 'OptimisticApp',
    textAlign: 'center',
    lineHeight: 20,
  },
});
