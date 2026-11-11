import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderButton from '../HeaderButton';
import Icon from '../Icon';
import { useStore } from '../../store';

// Profile Header matching Farid's exact requirements:
// - Left: 'x' close button
// - Center: Avatar with pencil edit badge in bottom-right corner, name, online status
// - Right: 'more-horizontal' disabled button
export default function ProfileHeader({ onClose, onEditPress }) {
  const displayName = useStore((s) => s.identity?.displayName || 'Ai-Chan');
  const avatarLetter = (displayName.trim()[0] || 'A').toUpperCase();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <HeaderButton icon="x" onPress={onClose} />
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editBadge}
            onPress={onEditPress}>
            <Icon name="edit-2" size={12} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <HeaderButton icon="more-horizontal" disabled onPress={() => {}} />
      </View>

      <View style={styles.identityBlock}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.status}>online</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f9a8d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000000',
    fontSize: 28,
    fontFamily: 'OptimisticApp-Bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333336',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityBlock: {
    alignItems: 'center',
    marginTop: 10,
  },
  name: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'OptimisticApp-Bold',
  },
  status: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp',
    marginTop: 2,
  },
});
