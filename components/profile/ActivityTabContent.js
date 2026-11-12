import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../Icon';

const SAMPLE_ACTIVITIES = [
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
];

export default function ActivityTabContent({ onSelectActivity }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#ffffff"
          colors={['#ffffff']}
        />
      }>
      <Text style={styles.dateHeader}>Hari ini</Text>

      {SAMPLE_ACTIVITIES.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          style={styles.activityRow}
          onPress={() => onSelectActivity(item)}>
          <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
            <Icon name={item.icon} size={20} color={item.iconColor} />
            {item.hasAlertDot && <View style={styles.alertDot} />}
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dateHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'OptimisticApp-Bold',
    marginVertical: 10,
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
    position: 'relative',
  },
  alertDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  infoCol: {
    flex: 1,
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
    marginBottom: 4,
  },
  time: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'OptimisticApp',
  },
});
