import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, ScrollView, StyleSheet, View } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Reanimated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Sidebar, { SIDEBAR_WIDTH } from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import Composer from '../components/Composer';
import TabBar from '../components/TabBar';
import ChatBubble from '../components/ChatBubble';
import ReplyMessage from '../components/ReplyMessage';
import TypingIndicator from '../components/TypingIndicator';
import ScrollToBottomButton from '../components/ScrollToBottomButton';
import { getGroupFlags } from '../components/messageGrouping';
import { ROUTES, useRouter } from '../navigation/router';
import { useStore } from '../store';

// Chat (home) page. Moved out of App.js verbatim: sidebar push,
// keyboard lift, header overlay + fade, grouped bubbles, drag reply,
// composer, TabBar. The only routing it knows is: sidebar settings
// button pushes the settings route.
export default function ChatScreen() {
  const { push } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHeaderHeight, setChatHeaderHeight] = useState(148);
  const messages = useStore((s) => s.chat.messages);
  const replyTo = useStore((s) => s.chat.replyTo);
  const sendMessage = useStore((s) => s.chat.sendMessage);
  const setReplyTo = useStore((s) => s.chat.setReplyTo);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const scrollRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Sidebar swipe, close only, faithful to Muse: when open, a left
  // swipe anywhere closes it, same as the hamburger button. No
  // swipe to open. Threshold 60, same as drag-to-reply.
  const sidebarOpenRef = useRef(false);
  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  const sidebarPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) =>
        sidebarOpenRef.current &&
        gesture.dx < -12 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderRelease: (evt, gesture) => {
        if (sidebarOpenRef.current && gesture.dx < -60) setSidebarOpen(false);
      },
      onPanResponderTerminate: () => {},
    }),
  ).current;

  // Keyboard mimic (Muse behavior): composer moves up with the keyboard,
  // TabBar is covered by the keyboard while typing, back when it closes.
  // TabBar is always mounted, never hidden by code — the keyboard
  // (system window) simply covers it while open. Composer stops at the
  // TabBar top, never goes to the screen bottom. Fix: keep TabBar always
  // mounted below the top part, and pad the top part by max(0, K - T).
  const keyboardHeight = useSharedValue(0);
  const tabBarHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        keyboardHeight.value = Math.max(e.height, 0);
      },
    },
    [],
  );

  const animatedTopStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, keyboardHeight.value - tabBarHeight.value),
  }));

  // Push animation: the whole main page TRANSLATES right by the sidebar
  // width, keeping its full width — it does NOT shrink.
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarOpen ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, slideAnim]);

  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distance = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    setShowScrollButton(distance > 80);
  };

  const handleReply = (target) => {
    setReplyTo(target);
  };

  const handleSend = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SIDEBAR_WIDTH],
  });

  const renderMessage = (m, index, list) => {
    if (m.replyTo) {
      return <ReplyMessage key={m.id} message={m} onReply={handleReply} />;
    }
    const { isFirst, isLast } = getGroupFlags(list, index);
    return (
      <View key={m.id} style={{ marginBottom: isLast ? 12 : 4 }}>
        <ChatBubble role={m.role} text={m.text} isFirst={isFirst} isLast={isLast} onReply={handleReply} />
      </View>
    );
  };

  return (
    <View style={styles.root} {...sidebarPanResponder.panHandlers}>
      <Sidebar onSettingsPress={() => { setSidebarOpen(false); push(ROUTES.settings); }} />
      <Animated.View style={[styles.main, { transform: [{ translateX }] }]}>
        <Reanimated.View style={[styles.topPart, animatedTopStyle]}>
          <View style={styles.messagesWrap}>
            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={[styles.messagesContent, { paddingTop: chatHeaderHeight }]}
              onScroll={handleScroll}
              scrollEventThrottle={16}>
              {messages.map((m, i, list) => renderMessage(m, i, list))}
              <TypingIndicator />
            </ScrollView>
            <ScrollToBottomButton
              visible={showScrollButton}
              onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
            />
          </View>
          <Composer onSend={handleSend} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
        </Reanimated.View>
        <View onLayout={(e) => { tabBarHeight.value = e.nativeEvent.layout.height; }}>
          <TabBar />
        </View>
        <ChatHeader
          onMenuPress={() => setSidebarOpen((v) => !v)}
          status="Installing preview build"
          onLayout={(e) => setChatHeaderHeight(e.nativeEvent.layout.height)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  main: { flex: 1, backgroundColor: '#000', zIndex: 1 },
  topPart: { flex: 1 },
  messagesWrap: { flex: 1 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
});
