import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from '../Icon';

// Bottom sheet detail matching Meta Muse ActivityDetailBottomSheet
// Screenshot ground truth: Selesai pill, MAIN section, checkmark steps
export default function ActivityDetailSheet({ visible, activity, onClose }) {
  if (!visible || !activity) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.grabber} />
              
              <View style={styles.statusRow}>
                <View style={styles.badgeSelesai}>
                  <Text style={styles.badgeText}>Selesai</Text>
                </View>
                <Text style={styles.timestampText}>{activity.time || '10:26am'}</Text>
              </View>

              <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.titleText}>{activity.title}</Text>
                <Text style={styles.subtitleText}>{activity.subtitle}</Text>

                <View style={styles.bodyBox}>
                  <Text style={styles.bodyText}>
                    {activity.detail ||
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
                      {activity.stepDesc || 'Retrieved records from memory bank'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity activeOpacity={0.8} style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Tutup</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
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
