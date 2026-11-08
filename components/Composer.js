import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';
import ComposerReplyPreview from './ComposerReplyPreview';

const ATTACH_OPTIONS = [
  { icon: 'camera', label: 'Kamera' },
  { icon: 'image', label: 'Galeri' },
  { icon: 'file', label: 'File' },
];

export default function Composer({ onSend, replyTo, onCancelReply }) {
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const hasText = text.trim().length > 0;

  const handleSend = () => {
    if (!hasText) return;
    onSend(text);
    setText('');
  };

  return (
    <View style={styles.wrap}>
      {menuOpen && (
        <View style={styles.menu}>
          {ATTACH_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.label} activeOpacity={0.7} style={styles.menuRow} onPress={() => setMenuOpen(false)}>
              <Icon name={opt.icon} size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.bar}>
        <ComposerReplyPreview replyTo={replyTo} onCancel={onCancelReply} />
        <View style={styles.inputRow}>
          <TouchableOpacity activeOpacity={0.7} style={styles.plusButton} onPress={() => setMenuOpen((v) => !v)}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Kirim pesan"
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
            multiline
          />
          {hasText ? (
            <TouchableOpacity activeOpacity={0.7} style={styles.sendButton} onPress={handleSend}>
              <Icon name="arrow-up" size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.7} style={styles.micButton}>
              <Icon name="mic" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingBottom: 8 },
  menu: { backgroundColor: '#1c1c1c', borderRadius: 16, paddingVertical: 8, marginBottom: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  menuIcon: { marginRight: 12 },
  menuLabel: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  bar: { backgroundColor: '#262626', borderRadius: 28, paddingLeft: 6, paddingRight: 6, paddingVertical: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  plusButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3a3a3a', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp', paddingHorizontal: 8, maxHeight: 120 },
  micButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3a3a3a', alignItems: 'center', justifyContent: 'center' },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f02b9b', alignItems: 'center', justifyContent: 'center' },
});
