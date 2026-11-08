import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoadingOverlay({ visible = false, message = '' }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={message ? styles.card : styles.circle}>
        <ActivityIndicator size="large" color="#ffffff" />
        {Boolean(message) && <Text style={styles.text}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 28,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'OptimisticApp',
    marginTop: 12,
    textAlign: 'center',
  },
});
