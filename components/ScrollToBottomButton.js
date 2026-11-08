import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';

// 4 — scroll-to-bottom button. Parent decides visibility (show when the
// list is scrolled up) and passes onPress, usually scrollToEnd.
// Self-positioned: centred, just above the composer.
export default function ScrollToBottomButton({ visible, onPress }) {
  if (!visible) return null;
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={onPress}>
      <Icon name="arrow-down" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { position: 'absolute', bottom: 12, left: '50%', marginLeft: -22, width: 44, height: 44, borderRadius: 22, backgroundColor: '#f02b9b', alignItems: 'center', justifyContent: 'center' },
});
