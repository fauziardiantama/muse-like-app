import { useState } from 'react';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Quickstart page: ONE page, always. Next/Prev do not navigate to
// another screen: they only change which section form is rendered
// inside this same page. That is the whole requirement for now.
// Forms are visual only (Farid's order): the inputs here do not
// submit, validate, or apply anything — real quickstart detail
// (fields, validate, apply) is for later. Section order follows the
// quickstart steps from the gateway API, but the fields shown are
// placeholders, not the real /api/quickstart/fields shapes.
const SECTIONS = [
  { key: 'model_provider', title: 'Model Provider', fields: ['Provider', 'Model'] },
  { key: 'risk_profile', title: 'Risk Profile', fields: ['Preset'] },
  { key: 'runtime_profile', title: 'Runtime Profile', fields: ['Preset'] },
  { key: 'memory', title: 'Memory', fields: ['Jenis'] },
  { key: 'channels', title: 'Channels', fields: ['Channel', 'Alias'] },
  { key: 'peer_groups', title: 'Peer Groups', fields: ['Channel', 'Peer'] },
  { key: 'agent', title: 'Agent', fields: ['Nama', 'System Prompt'] },
];

export default function QuickstartScreen() {
  const [index, setIndex] = useState(0);
  const section = SECTIONS[index];
  const isFirst = index === 0;
  const isLast = index === SECTIONS.length - 1;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Quickstart</Text>
      <Text style={styles.step}>
        Langkah {index + 1} dari {SECTIONS.length} — {section.title}
      </Text>
      <View style={styles.form}>
        {section.fields.map((label) => (
          <View key={label} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={label}
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ))}
      </View>
      <View style={styles.nav}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.navButton, isFirst && styles.navButtonDisabled]}
          disabled={isFirst}
          onPress={() => setIndex((i) => Math.max(0, i - 1))}>
          <Text style={[styles.navText, isFirst && styles.navTextDisabled]}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.navButton, styles.navButtonNext, isLast && styles.navButtonDisabled]}
          disabled={isLast}
          onPress={() => setIndex((i) => Math.min(SECTIONS.length - 1, i + 1))}>
          <Text style={[styles.navText, styles.navTextNext, isLast && styles.navTextDisabled]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16, paddingTop: (StatusBar.currentHeight || 0) + 24 },
  title: { color: '#fff', fontSize: 20, fontFamily: 'OptimisticApp-Bold', marginBottom: 8 },
  step: { color: '#888', fontSize: 16, fontFamily: 'OptimisticApp', marginBottom: 24 },
  form: { flex: 1 },
  field: { marginBottom: 16 },
  fieldLabel: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp', marginBottom: 8 },
  input: { backgroundColor: '#262626', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 24 },
  navButton: { backgroundColor: '#262626', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32 },
  navButtonNext: { backgroundColor: '#fff' },
  navButtonDisabled: { opacity: 0.4 },
  navText: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp-Bold' },
  navTextNext: { color: '#000' },
  navTextDisabled: { color: '#888' },
});
