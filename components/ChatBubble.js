import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Icon from './Icon';
import Markdown from 'react-native-markdown-display';

const USER_PINK = '#f02b9b';
const AI_GREY = '#262626';

// Drag-to-reply bubble, matching Muse: drag the bubble RIGHT and let
// go, it snaps back, and the composer shows the reply preview. There is
// no drag-left gesture: dragging left only undoes a right drag (bubble
// returns, icon fades out), it never shows an icon or triggers a reply.
// A rightward horizontal drag wins over the ScrollView's vertical
// scroll; a vertical drag stays with the ScrollView.
export default function ChatBubble({ role, text, isFirst, isLast, onReply }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const dxRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) =>
        gesture.dx > 12 && gesture.dx > Math.abs(gesture.dy) * 1.5,
      onPanResponderMove: (evt, gesture) => {
        const clamped = Math.max(0, gesture.dx);
        dxRef.current = clamped;
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (evt, gesture) => {
        const passed = gesture.dx > 60;
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        if (passed && onReply) {
          onReply({ author: role === 'ai' ? 'Ai-Chan' : 'Anda', text });
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const radii =
    role === 'user'
      ? {
          borderTopLeftRadius: 24,
          borderTopRightRadius: isFirst ? 24 : 6,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: isLast ? 24 : 6,
        }
      : {
          borderTopLeftRadius: isFirst ? 24 : 6,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: isLast ? 24 : 6,
          borderBottomRightRadius: 24,
        };

  // Drag reply icon: fades in only on a right drag, and follows the
  // bubble (it is a child of the translated bubble, so it moves at the
  // same speed, it does not stand still while the bubble moves
  // further). Icon is on the left of the bubble, for both roles.
  // Dragging left back only returns the bubble and fades the icon out.
  const dragIconOpacity = translateX.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.bubble,
        role === 'user' ? styles.user : styles.ai,
        radii,
        { transform: [{ translateX }] },
      ]}>
      <Animated.View style={[styles.dragIcon, { opacity: dragIconOpacity }]} pointerEvents="none">
        <Icon name="corner-up-left" size={20} color="#888" />
      </Animated.View>
      <Markdown style={markdownStyle}>{text}</Markdown>
    </Animated.View>
  );
}

// Basic default react-native-markdown-display, only for chat bubbles
// (user + ai, via ChatBubble). No custom rules, no plugins, no
// mermaid. Style only to match the old bubble text (white, 16,
// OptimisticApp) and to keep a single paragraph from adding the
// library's default 10px top/bottom margin inside the bubble.
// Code blocks / blockquotes keep library defaults (light bg, dark
// text), which stay readable.
const markdownStyle = {
  text: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  textgroup: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  paragraph: { marginTop: 0, marginBottom: 0, color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  heading1: { color: '#fff', fontSize: 32, fontFamily: 'OptimisticApp' },
  heading2: { color: '#fff', fontSize: 24, fontFamily: 'OptimisticApp' },
  heading3: { color: '#fff', fontSize: 18, fontFamily: 'OptimisticApp' },
  heading4: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  heading5: { color: '#fff', fontSize: 13, fontFamily: 'OptimisticApp' },
  heading6: { color: '#fff', fontSize: 11, fontFamily: 'OptimisticApp' },
  link: { color: '#fff', textDecorationLine: 'underline' },
};

const styles = StyleSheet.create({
  dragIcon: { position: 'absolute', left: -32, top: '50%', marginTop: -10 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, maxWidth: '85%' },
  user: { alignSelf: 'flex-end', backgroundColor: USER_PINK },
  ai: { alignSelf: 'flex-start', backgroundColor: AI_GREY },
});
