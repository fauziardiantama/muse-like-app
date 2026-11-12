import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from '../Icon';

// 4-icon segmented bar matching Meta Muse Hatch Status layout
// Tabs: list (Activity), shield (Tasks), tv (Desktop), clock (Identity/History)
export default function ProfileTabBar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'activity', icon: 'list' },
    { id: 'tasks', icon: 'shield' },
    { id: 'display', icon: 'tv' },
    { id: 'history', icon: 'clock' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.segmentedBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onSelectTab(tab.id)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}>
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
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 4,
    width: '100%',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#333336',
  },
});
