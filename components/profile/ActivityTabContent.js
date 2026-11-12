import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../Icon';
import { useStore } from '../../store';

function getToolIconConfig(toolName) {
  const lower = (toolName || '').toLowerCase();
  if (lower.includes('shell') || lower.includes('bash') || lower.includes('terminal')) {
    return { icon: 'zap', iconBg: '#422006', iconColor: '#facc15' };
  }
  if (lower.includes('search') || lower.includes('web') || lower.includes('query')) {
    return { icon: 'search', iconBg: '#374151', iconColor: '#9ca3af' };
  }
  if (lower.includes('file') || lower.includes('read') || lower.includes('write')) {
    return { icon: 'file-text', iconBg: '#1e293b', iconColor: '#38bdf8' };
  }
  if (lower.includes('net') || lower.includes('http') || lower.includes('api')) {
    return { icon: 'globe', iconBg: '#1e3a8a', iconColor: '#60a5fa' };
  }
  return { icon: 'zap', iconBg: '#27272a', iconColor: '#d1d5db' };
}

function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${strMinutes}${ampm}`;
  } catch {
    return String(isoString);
  }
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isYesterday(d) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d, yesterday);
}

function formatToolTitle(rawTool) {
  if (!rawTool) return 'Tool';
  const str = String(rawTool);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapLogToActivity(ev, index) {
  const rawTool = ev.attributes?.tool || 'Tool';
  const title = formatToolTitle(rawTool);
  const subtitle = ev.message || (ev.event?.outcome === 'failure' ? 'Failed' : 'Executed');
  const timestamp = ev['@timestamp'] || ev.timestamp;
  const time = formatTime(timestamp);
  const isFailure = ev.event?.outcome === 'failure' || (ev.severity_number && ev.severity_number >= 13);
  const iconConfig = getToolIconConfig(rawTool);

  return {
    id: ev.id || `log-${index}-${Date.now()}`,
    icon: iconConfig.icon,
    iconBg: iconConfig.iconBg,
    iconColor: iconConfig.iconColor,
    title,
    subtitle,
    time,
    hasAlertDot: isFailure,
    rawDate: timestamp ? new Date(timestamp) : new Date(),
    detail: 'Detail eksekusi tool tercatat di server.',
    stepDesc: `Executed ${rawTool} operation`,
  };
}

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
  const toolActivities = useStore((s) => s.chat.toolActivities);
  const fetchToolActivities = useStore((s) => s.chat.fetchToolActivities);

  useEffect(() => {
    fetchToolActivities();
  }, [fetchToolActivities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchToolActivities();
    } finally {
      setRefreshing(false);
    }
  };

  const hasLiveLogs = Array.isArray(toolActivities) && toolActivities.length > 0;
  let todayActivities = SAMPLE_ACTIVITIES_TODAY;
  let yesterdayActivities = SAMPLE_ACTIVITIES_YESTERDAY;

  if (hasLiveLogs) {
    const mapped = toolActivities.map(mapLogToActivity);
    const todayList = [];
    const yesterdayList = [];

    mapped.forEach((item) => {
      if (isYesterday(item.rawDate)) {
        yesterdayList.push(item);
      } else {
        todayList.push(item);
      }
    });

    todayActivities = todayList;
    yesterdayActivities = yesterdayList;
  }

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
      {todayActivities.length > 0 ? (
        todayActivities.map(renderRow)
      ) : (
        <Text style={styles.emptyNotice}>Tidak ada aktivitas tool hari ini.</Text>
      )}

      {yesterdayActivities.length > 0 && (
        <>
          <Text style={[styles.dateHeader, styles.dateHeaderSecondary]}>Kemarin</Text>
          {yesterdayActivities.map(renderRow)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyNotice: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp',
    marginVertical: 8,
  },
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
