import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';

// Shared header side button, 44x44 dark circle. Used for the hamburger
// in chat and for the chevron-left back button in Settings, same place,
// same size, same style. The button itself is the reused component;
// only the icon name changes.
export default function HeaderButton({ icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.button}>
      <Icon name={icon} size={24} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
});
