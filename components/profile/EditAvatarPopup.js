import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from '../Icon';

// Popup menu shown when clicking the avatar edit pencil button
// Faithful to Meta Muse: floating card with 'Ubah avatar' and 'Edit nama'
export default function EditAvatarPopup({ visible, onClose }) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuCard}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.menuRow}
                onPress={onClose}>
                <Icon name="user" size={18} color="#ffffff" style={styles.menuIcon} />
                <Text style={styles.menuLabel}>Ubah avatar</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.menuRow}
                onPress={onClose}>
                <Icon name="type" size={18} color="#ffffff" style={styles.menuIcon} />
                <Text style={styles.menuLabel}>Edit nama</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 150,
  },
  menuCard: {
    width: 190,
    backgroundColor: '#262626',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#38383a',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'OptimisticApp',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3a3a3c',
    marginHorizontal: 12,
  },
});
