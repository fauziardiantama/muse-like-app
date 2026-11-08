import { StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import ChatBubble from './ChatBubble';

// 6 — sent replying chat: "Anda membalas <author>" label, the quoted
// bubble (truncated to 2 lines), then the reply bubble itself. Matching
// Muse: quoted text is greyed out (not white), and the reply bubble
// overlaps the quoted bubble slightly. The reply bubble stays draggable,
// like any other bubble, via ChatBubble.
export default function ReplyMessage({ message, onReply }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Icon name="corner-up-left" size={14} color="#888" />
        <Text style={styles.label}>Anda membalas {message.replyTo.author}</Text>
      </View>
      <View style={styles.quotedBubble}>
        <Text style={styles.quotedText} numberOfLines={2}>
          {message.replyTo.text}
        </Text>
      </View>
      <ChatBubble role={message.role} text={message.text} isFirst isLast onReply={onReply} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 6 },
  label: { color: '#888', fontSize: 13, fontFamily: 'OptimisticApp', marginLeft: 6 },
  quotedBubble: { alignSelf: 'flex-end', backgroundColor: '#262626', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, maxWidth: '85%', marginBottom: -4 },
  quotedText: { color: '#888', fontSize: 16, fontFamily: 'OptimisticApp' },
});
