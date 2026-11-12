import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../Icon';

const SAMPLE_ACTIVITIES_TODAY = [
  {
    id: '1',
    icon: 'globe',
    iconBg: '#1e3a8a',
    iconColor: '#60a5fa',
    title: 'Link external news article',
    subtitle: 'Interrupted',
    time: '10:36am',
    hasAlertDot: true,
    detail: 'Proses penautan artikel berita eksternal tertunda karena batasan jaringan.',
    stepDesc: 'Navigated to web endpoint and captured header response',
  },
  {
    id: '2',
    icon: 'search',
    iconBg: '#374151',
    iconColor: '#9ca3af',
    title: 'Search Edge0 quantization memory',
    subtitle: 'Found 5 results for Edge0 LLM quantization bits',
    time: '10:30am',
    detail: 'Pencarian memori konfigurasi model kuantisasi Edge0 berhasil diselesaikan.',
    stepDesc: 'Queried vector store and loaded 5 matching records',
  },
  {
    id: '3',
    icon: 'search',
    iconBg: '#374151',
    iconColor: '#9ca3af',
    title: 'Identify MobileMoE model and specs',
    subtitle: 'Asked for more details on MobileMoE model',
    time: '10:29am',
    detail: 'Mengidentifikasi spesifikasi teknis dan parameter routing arsitektur MobileMoE.',
    stepDesc: 'Extracted parameter table and validated memory constraints',
  },
  {
    id: '4',
    icon: 'search',
    iconBg: '#374151',
    iconColor: '#9ca3af',
    title: 'Check MoE mobile VRAM and B model',
    subtitle: 'Searched memory for MoE mobile VRAM and B model',
    time: '10:26am',
    detail: 'I checked your memory for the MoE mobile VRAM device and B model but found no matching results in cache.',
    stepDesc: 'Retrieved lines 60-90 from memory bank',
  },
  {
    id: '5',
    icon: 'file-text',
    iconBg: '#1e293b',
    iconColor: '#38bdf8',
    title: 'Sync session memory checkpoint',
    subtitle: 'Saved 12 state variables to persistent store',
    time: '10:14am',
    detail: 'Titik pemulihan sesi obrolan telah disinkronkan ke dalam penyimpanan lokal.',
    stepDesc: 'Committed state delta to disk storage and refreshed cache index',
  },
  {
    id: '6',
    icon: 'zap',
    iconBg: '#422006',
    iconColor: '#facc15',
    title: 'Run latency benchmark on Qwen-38B',
    subtitle: 'Measured 42 tokens/s inference speed',
    time: '09:50am',
    detail: 'Evaluasi inferensi kecepatan token LLM dual GPU selesai dengan metrik stabil.',
    stepDesc: 'Executed 100 warmup prompts and tracked streaming latency',
  },
];

const SAMPLE_ACTIVITIES_YESTERDAY = [
  {
    id: '7',
    icon: 'camera',
    iconBg: '#4c1d95',
    iconColor: '#c084fc',
    title: 'Synthesize avatar character portrait',
    subtitle: 'Rendered 1024x1024 PNG with Qwen-Image-2.1',
    time: '08:42pm',
    detail: 'Generasi visual profil karakter menggunakan model diffusion selesai tanpa sensor.',
    stepDesc: 'Loaded prompt embedding and extracted generated buffer',
  },
  {
    id: '8',
    icon: 'shield',
    iconBg: '#064e3b',
    iconColor: '#34d399',
    title: 'Verify headless interaction contract',
    subtitle: 'Passed 5/5 behavioural state machine tests',
    time: '07:18pm',
    detail: 'Pemeriksaan integritas kontrak interaksi diselesaikan di level Node.js lokal.',
    stepDesc: 'Ran headless state machine assertion suite in Termux',
  },
  {
    id: '9',
    icon: 'globe',
    iconBg: '#1e3a8a',
    iconColor: '#60a5fa',
    title: 'Fetch repository remote status',
    subtitle: 'Checked git origin for latest commit',
    time: '05:30pm',
    detail: 'Sinkronisasi riwayat remote repository master branch berhasil diverifikasi.',
    stepDesc: 'Connected to GitHub remote API and pulled status hash',
  },
  {
    id: '10',
    icon: 'message-circle',
    iconBg: '#7f1d1d',
    iconColor: '#f87171',
    title: 'Initialize chat session stream',
    subtitle: 'Reconnected WebSocket tunnel',
    time: '03:12pm',
    hasAlertDot: true,
    detail: 'Koneksi websocket sempat terputus dan berhasil dipulihkan secara otomatis.',
    stepDesc: 'Sent ping heartbeat and re-established TLS handshake',
  },
  {
    id: '11',
    icon: 'settings',
    iconBg: '#374151',
    iconColor: '#d1d5db',
    title: 'Configure theme and design tokens',
    subtitle: 'Standardized typography to OptimisticApp',
    time: '01:05pm',
    detail: 'Penyesuaian token desain dan tipografi seluruh layar diselaraskan ke standar Meta Muse.',
    stepDesc: 'Applied font family aliases to native assets font directory',
  },
];

export default function ActivityTabContent({ onSelectActivity }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const renderRow = (item) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.7}
      style={styles.activityRow}
      onPress={() => onSelectActivity(item)}>
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        <Icon name={item.icon} size={20} color={item.iconColor} />
      </View>

      <View style={styles.infoCol}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.time}>{item.time}</Text>
        {item.hasAlertDot && <View style={styles.unreadBadgeRight} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#8e8e93"
          colors={['#8e8e93', '#ffffff']}
          progressBackgroundColor="#1c1c1e"
          progressViewOffset={-10}
        />
      }>
      <Text style={styles.dateHeader}>Hari ini</Text>
      {SAMPLE_ACTIVITIES_TODAY.map(renderRow)}

      <Text style={[styles.dateHeader, styles.dateHeaderSecondary]}>Kemarin</Text>
      {SAMPLE_ACTIVITIES_YESTERDAY.map(renderRow)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 60,
  },
  dateHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'OptimisticApp-Bold',
    marginVertical: 10,
  },
  dateHeaderSecondary: {
    marginTop: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'OptimisticApp-Bold',
    marginBottom: 3,
  },
  subtitle: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp',
    lineHeight: 18,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  time: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'OptimisticApp',
  },
  unreadBadgeRight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginTop: 6,
  },
});
