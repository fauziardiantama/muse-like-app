import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Reanimated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from '../Icon';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Authentic Meta Muse Activity Detail In-Tree View Layer
// - No Android Dialog OS Modal
// - Backdrop fades in/out in-place
// - Sheet smoothly slides up/down from bottom
export default function ActivityDetailSheet({ visible, activity, onClose }) {
  // Keep last active activity data while closing animation finishes
  const [cachedActivity, setCachedActivity] = useState(activity);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (activity) {
      setCachedActivity(activity);
    }
  }, [activity]);

  useEffect(() => {
    const isVisible = visible && !!cachedActivity;
    progress.value = withTiming(isVisible ? 1 : 0, {
      duration: isVisible ? 280 : 220,
      easing: isVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [visible, cachedActivity, progress]);

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [SCREEN_HEIGHT, 0], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }],
    };
  });

  if (!cachedActivity) return null;

  return (
    <Reanimated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={styles.sheetOverlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Reanimated.View style={[styles.backdrop, backdropAnimatedStyle]} />
      </TouchableWithoutFeedback>

      <Reanimated.View style={[styles.sheetContainer, sheetAnimatedStyle]}>
        <View style={styles.grabber} />

        <View style={styles.statusRow}>
          <View style={styles.badgeSelesai}>
            <Text style={styles.badgeText}>Selesai</Text>
          </View>
          <Text style={styles.timestampText}>{cachedActivity.time || '10:26am'}</Text>
        </View>

        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>{cachedActivity.title}</Text>
          <Text style={styles.subtitleText}>{cachedActivity.subtitle}</Text>

          <View style={styles.bodyBox}>
            <Text style={styles.bodyText}>
              {cachedActivity.detail ||
                'Tindakan telah berhasil dijalankan dan diverifikasi dalam sistem memori asisten secara empiris.'}
            </Text>
          </View>

          <Text style={styles.sectionHeader}>MAIN</Text>

          <View style={styles.stepCard}>
            <View style={styles.stepIconWrap}>
              <Icon name="check" size={16} color="#34c759" />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Data memori telah diperoleh</Text>
              <Text style={styles.stepDesc}>
                {cachedActivity.stepDesc || 'Retrieved records from memory bank'}
              </Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Tutup</Text>
          </TouchableOpacity>
        </ScrollView>
      </Reanimated.View>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 30,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheetContainer: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: '#2c2c2e',
    zIndex: 10,
    elevation: 20,
  },
  grabber: {
    width: 36,
    height: 4,
    backgroundColor: '#3a3a3c',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeSelesai: {
    backgroundColor: '#0e3820',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#34c759',
    fontSize: 12,
    fontFamily: 'OptimisticApp-Bold',
  },
  timestampText: {
    color: '#8e8e93',
    fontSize: 12,
    fontFamily: 'OptimisticApp',
  },
  contentScroll: {
    marginTop: 4,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'OptimisticApp-Bold',
    lineHeight: 26,
    marginBottom: 6,
  },
  subtitleText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontFamily: 'OptimisticApp',
    lineHeight: 20,
    marginBottom: 16,
  },
  bodyBox: {
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  bodyText: {
    color: '#d1d1d6',
    fontSize: 14,
    fontFamily: 'OptimisticApp',
    lineHeight: 20,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'OptimisticApp-Bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  stepIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'OptimisticApp-Bold',
  },
  stepDesc: {
    color: '#8e8e93',
    fontSize: 12,
    fontFamily: 'OptimisticApp',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#333336',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'OptimisticApp-Bold',
  },
});
