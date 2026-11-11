import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderButton from './HeaderButton';
import Icon from './Icon';
import { useStore } from '../store';

// Single Persistent Header for both Chat and Profile
// Never unmounted, stays in top overlay (zIndex: 100).
// Transitions its own icons and actions when profile is open:
// - Left: 'menu' (sidebar) <-> 'x' (close profile)
// - Right: spacer <-> 'more-horizontal' (disabled)
// - Avatar: static single center anchor, shows 'edit-2' badge when profile open
export default function ChatHeader({
  onMenuPress,
  status,
  onLayout,
  isProfileOpen = false,
  onOpenProfile,
  onCloseProfile,
  onEditAvatarPress,
}) {
  const displayName = useStore((s) => s.identity?.displayName || 'Ai-Chan');
  const avatarLetter = (displayName.trim()[0] || 'A').toUpperCase();

  const handleCenterPress = () => {
    if (!isProfileOpen && onOpenProfile) {
      onOpenProfile();
    }
  };

  return (
    <View style={styles.header} onLayout={onLayout}>
      <LinearGradient
        colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.row}>
        {isProfileOpen ? (
          <HeaderButton icon="x" onPress={onCloseProfile} />
        ) : (
          <HeaderButton icon="menu" onPress={onMenuPress} />
        )}

        <TouchableOpacity
          activeOpacity={isProfileOpen ? 1 : 0.8}
          style={styles.center}
          onPress={handleCenterPress}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            {isProfileOpen && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.editBadge}
                onPress={onEditAvatarPress}>
                <Icon name="edit-2" size={12} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>

          {isProfileOpen ? (
            <View style={styles.profileIdentityBlock}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileStatus}>online</Text>
            </View>
          ) : (
            <View style={styles.namePill}>
              <Text style={styles.name}>{displayName}</Text>
              {status ? <Text style={styles.status}>{status}</Text> : null}
            </View>
          )}
        </TouchableOpacity>

        {isProfileOpen ? (
          <HeaderButton icon="more-horizontal" disabled onPress={() => {}} />
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    paddingBottom: 8,
  },
  center: { flex: 1, alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f9a8d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#000', fontSize: 28, fontFamily: 'OptimisticApp-Bold' },
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
  namePill: {
    backgroundColor: '#262626',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: -12,
    alignItems: 'center',
  },
  name: { color: '#fff', fontSize: 14, fontFamily: 'OptimisticApp-Bold' },
  status: { color: '#888', fontSize: 12, fontFamily: 'OptimisticApp', marginTop: 2 },
  profileIdentityBlock: { alignItems: 'center', marginTop: 8 },
  profileName: { color: '#ffffff', fontSize: 18, fontFamily: 'OptimisticApp-Bold' },
  profileStatus: { color: '#8e8e93', fontSize: 13, fontFamily: 'OptimisticApp', marginTop: 2 },
  sideSpacer: { width: 44 },
});
