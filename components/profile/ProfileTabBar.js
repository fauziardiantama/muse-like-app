import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from '../Icon';

// 4-icon segmented bar matching Meta Muse Hatch Status layout
// Animated sliding pill indicator smoothly shifts between tabs
export default function ProfileTabBar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'activity', icon: 'list' },
    { id: 'tasks', icon: 'shield' },
    { id: 'display', icon: 'tv' },
    { id: 'history', icon: 'clock' },
  ];

  const [barWidth, setBarWidth] = useState(0);
  const translateX = useSharedValue(0);

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const effectiveWidth = Math.max(0, barWidth - 8); // 4dp padding on each side
  const tabWidth = effectiveWidth > 0 ? effectiveWidth / tabs.length : 0;

  useEffect(() => {
    if (tabWidth > 0 && activeIndex >= 0) {
      translateX.value = withTiming(activeIndex * tabWidth, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [activeIndex, tabWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View
        style={styles.segmentedBar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {tabWidth > 0 && (
          <Reanimated.View
            style={[
              styles.slidingIndicator,
              { width: tabWidth },
              indicatorStyle,
            ]}
          />
        )}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onSelectTab(tab.id)}
              style={styles.tabButton}>
              <Icon
                name={tab.icon}
                size={20}
                color={isActive ? '#ffffff' : '#8e8e93'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    zIndex: 10,
    elevation: 6,
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 4,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-between',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: '#333336',
    borderRadius: 20,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    zIndex: 2,
  },
});
