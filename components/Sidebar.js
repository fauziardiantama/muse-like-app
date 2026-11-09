import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import TopFade from './TopFade';
import { useStore } from '../store';

export const SIDEBAR_WIDTH = Math.round(Dimensions.get('window').width * 0.78);

const TABS = [
  { icon: 'message-circle', label: 'Obrolan utama', active: true },
  { icon: 'file-text', label: 'Kabar', active: false },
  { icon: 'zap', label: 'Ide', active: false },
  { icon: 'check-square', label: 'Sasaran', active: false },
  { icon: 'grid', label: 'Perpustakaan', active: false },
];

export default function Sidebar({ onSettingsPress, onSelectChat }) {
  const insets = useSafeAreaInsets();
  const [collapsed, setCollapsed] = useState(false);
  const [tabCollapsed, setTabCollapsed] = useState(false);

  const displayName = useStore((s) => s.identity?.displayName || 'Ai-Chan');
  const activeAgent = useStore((s) => s.identity?.activeAgent || 'aichan');
  const activeSessionId = useStore((s) => s.chat?.activeSessionId);
  const mainSessionIds = useStore((s) => s.chat?.mainSessionIds || {});
  const allSessions = useStore((s) => s.sessions?.list || []);
  const loadSessions = useStore((s) => s.sessions?.loadSessions);
  const openSession = useStore((s) => s.chat?.openSession);
  const initChat = useStore((s) => s.chat?.initChat);

  // Load all sessions from gateway across all agents
  useEffect(() => {
    loadSessions?.();
  }, [loadSessions]);

  // Exclude main conversations of any agent
  const mainValues = Object.values(mainSessionIds);
  const sideSessions = (allSessions || []).filter((s) => {
    const sid = s.session_id || s.session_key;
    return (
      !mainValues.includes(sid) &&
      !mainValues.includes(s.session_key) &&
      !mainValues.includes(s.session_id)
    );
  });

  const isMainSelected = activeSessionId === mainSessionIds[activeAgent];

  return (
    <View style={styles.sidebar}>
      <View style={[styles.inner, { paddingBottom: 24 + insets.bottom }]}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 56 + (insets.top || 0) }]}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{displayName}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.tabHeader}
            onPress={() => setTabCollapsed((v) => !v)}>
            <Text style={styles.sectionTitle}>TAB</Text>
          </TouchableOpacity>
          {!tabCollapsed && (
            <>
              <Text style={styles.hint}>Anda bisa mengurutkan ulang dengan menekan lama</Text>
              {TABS.map((tab) => {
                const isMainTab = tab.label === 'Obrolan utama';
                const selected = isMainTab && isMainSelected;
                return (
                  <TouchableOpacity
                    key={tab.label}
                    activeOpacity={0.7}
                    style={[styles.tabRow, selected && styles.tabRowActive]}
                    onPress={() => {
                      if (isMainTab) {
                        initChat(activeAgent);
                        onSelectChat?.();
                      }
                    }}>
                    <Icon
                      name={tab.icon}
                      size={20}
                      color={selected ? '#fff' : '#aaa'}
                      style={styles.tabIcon}
                    />
                    <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Garis tipis tepat di bawah baris terakhir Tab, tepat di atas teks obrolan selingan */}
          <View style={styles.divider} />

          {/* Header Obrolan Selingan (klik untuk menutup/collapse isinya) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.sideHeader}
            onPress={() => setCollapsed((v) => !v)}>
            <Text style={styles.sectionTitle}>OBROLAN SELINGAN</Text>
            <Icon name="archive" size={18} color="#aaa" />
          </TouchableOpacity>

          {/* Isi Obrolan Selingan */}
          {!collapsed && (
            sideSessions.length === 0 ? (
              <Text style={styles.emptyText}>Akan muncul di sini jika Anda memulai.</Text>
            ) : (
              <View style={styles.sideList}>
                {sideSessions.map((session) => {
                  const sid = session.session_id || session.session_key;
                  const isSelected = activeSessionId === sid;
                  const title = session.name || session.title || 'Obrolan selingan tanpa judul';
                  return (
                    <TouchableOpacity
                      key={sid}
                      activeOpacity={0.7}
                      style={[styles.sessionRow, isSelected && styles.sessionRowActive]}
                      onPress={() => {
                        openSession(sid, session.agent_alias);
                        onSelectChat?.();
                      }}>
                      <Text style={styles.sessionLabel} numberOfLines={1}>
                        {title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          )}
        </ScrollView>

        {/* Efek Dark Fade di bagian atas */}
        <TopFade height={44} />

        {/* Bottom bar tetap menempel di bawah */}
        <View style={styles.bottomBar}>
          <TouchableOpacity activeOpacity={0.7} style={styles.bottomCircle} onPress={onSettingsPress}>
            <Icon name="settings" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.searchPill}>
            <Icon name="search" size={18} color="#fff" style={styles.searchIcon} />
            <Text style={styles.searchLabel}>Cari</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.bottomCircle}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 0,
  },
  inner: { width: SIDEBAR_WIDTH, flex: 1, paddingHorizontal: 16, paddingBottom: 24 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  title: { color: '#fff', fontSize: 28, fontFamily: 'OptimisticApp-Bold', marginBottom: 24 },
  sectionTitle: { color: '#888', fontSize: 13, fontFamily: 'OptimisticApp-Bold', letterSpacing: 1 },
  hint: { color: '#888', fontSize: 13, fontFamily: 'OptimisticApp', marginTop: 6, marginBottom: 12 },
  tabRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  tabRowActive: { backgroundColor: '#262626' },
  tabIcon: { marginRight: 12 },
  tabLabel: { color: '#aaa', fontSize: 16, fontFamily: 'OptimisticApp' },
  tabLabelActive: { color: '#fff' },
  divider: {
    height: 1,
    backgroundColor: '#1f1f1f',
    marginTop: 16,
    marginBottom: 8,
  },
  sideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyText: { color: '#888', fontSize: 14, fontFamily: 'OptimisticApp', marginTop: 4 },
  sideList: { marginTop: 4 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 2,
  },
  sessionRowActive: {
    backgroundColor: '#262626',
  },
  tabHeader: {
    paddingVertical: 4,
  },
  sessionLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OptimisticApp-Medium',
  },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  bottomCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
  searchPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#262626', borderRadius: 24, paddingHorizontal: 20, height: 48, flex: 1, marginHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchLabel: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
});
