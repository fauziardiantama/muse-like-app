import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Icon from '../components/Icon';
import { ROUTES, useRouter } from '../navigation/router';
import { useStore } from '../store';

const SECTIONS = [
  { key: 'model_provider', title: 'Model Provider', subtitle: 'Pilih atau konfigurasi AI model provider' },
  { key: 'risk_profile', title: 'Risk Profile', subtitle: 'Atur batas keamanan eksekusi perintah' },
  { key: 'runtime_profile', title: 'Runtime Profile', subtitle: 'Tentukan kuota waktu dan konteks agen' },
  { key: 'memory', title: 'Memory', subtitle: 'Pilih media penyimpanan memori jangka panjang' },
  { key: 'channels', title: 'Channels', subtitle: 'Hubungkan kanal komunikasi eksternal (opsional)' },
  { key: 'peer_groups', title: 'Peer Groups', subtitle: 'Atur kolaborasi multi-agen (opsional)' },
  { key: 'agent', title: 'Agent Identity', subtitle: 'Nama agen dan berkas kepribadian SOUL.md' },
];

export default function QuickstartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onboarding = useStore((s) => s.onboarding);
  const stateData = onboarding.stateData;

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // --- Step 1: Model Provider State ---
  const [modelMode, setModelMode] = useState('existing'); // 'existing' | 'fresh'
  const [existingProvider, setExistingProvider] = useState('');
  const [providerType, setProviderType] = useState('openrouter');
  const [providerAlias, setProviderAlias] = useState('primary');
  const [providerModel, setProviderModel] = useState('gpt-4o');
  const [dynamicFields, setDynamicFields] = useState({});

  // --- Step 2: Risk Profile State ---
  const [riskValue, setRiskValue] = useState('balanced');

  // --- Step 3: Runtime Profile State ---
  const [runtimeValue, setRuntimeValue] = useState('unbounded');

  // --- Step 4: Memory State ---
  const [memoryValue, setMemoryValue] = useState('sqlite');

  // --- Step 5: Channels State ---
  const [channelsList, setChannelsList] = useState([]);

  // --- Step 7: Agent Identity & Personality State ---
  const [agentName, setAgentName] = useState('Ai-Chan');
  const [systemPrompt, setSystemPrompt] = useState('You are Ai-Chan, an affectionate and exceptionally capable assistant.');
  const [activePersonalityTab, setActivePersonalityTab] = useState('SOUL.md');
  const [personalityFiles, setPersonalityFiles] = useState({
    'SOUL.md': '',
    'IDENTITY.md': '',
    'USER.md': '',
  });

  // Fetch initial quickstart state on mount (use cached stateData if already available)
  useEffect(() => {
    const initData = (data) => {
      if (data?.model_providers?.length > 0) {
        setModelMode('existing');
        setExistingProvider(data.model_providers[0]);
      } else {
        setModelMode('fresh');
      }
      if (data?.risk_presets?.length > 0) {
        setRiskValue(data.risk_presets.find((p) => p.preset_name === 'balanced')?.preset_name || data.risk_presets[0].preset_name);
      }
      if (data?.runtime_presets?.length > 0) {
        setRuntimeValue(data.default_runtime_profile || 'unbounded');
      }
      if (data?.memory_kinds?.length > 0) {
        setMemoryValue(data.memory_kinds.includes('sqlite') ? 'sqlite' : data.memory_kinds[0]);
      }
    };

    if (stateData) {
      initData(stateData);
    } else {
      onboarding.fetchQuickstartState().then(initData).catch((err) => {
        console.warn('[QuickstartScreen] Gagal inisialisasi state:', err);
        setErrorBanner(err?.message || 'Gagal memuat status awal gateway. Pastikan ZeroClaw aktif.');
      });
    }
  }, []);

  // Fetch dynamic fields when switching fresh provider type
  useEffect(() => {
    if (modelMode === 'fresh' && providerType) {
      onboarding.fetchSectionFields('model_provider', providerType);
    }
  }, [modelMode, providerType]);

  // Fetch personality templates when entering Step 7 or when agent name changes with debounce
  const loadTemplates = useCallback((targetName) => {
    onboarding.fetchPersonalityTemplates({
      agent_name: targetName || 'Ai-Chan',
      user_name: 'Farid Frederick',
      timezone: 'Asia/Jakarta',
    }).then((res) => {
      if (res?.files) {
        const fileMap = {};
        res.files.forEach((f) => {
          fileMap[f.filename] = f.content;
        });
        setPersonalityFiles((prev) => ({
          ...fileMap,
          ...prev, // Preserve user edits if already modified
          'SOUL.md': prev['SOUL.md'] || fileMap['SOUL.md'] || '',
          'IDENTITY.md': prev['IDENTITY.md'] || fileMap['IDENTITY.md'] || '',
          'USER.md': prev['USER.md'] || fileMap['USER.md'] || '',
        }));
      }
    }).catch((err) => {
      console.warn('[QuickstartScreen] Gagal memuat template personality:', err);
    });
  }, []);

  const templateTimerRef = useRef(null);

  useEffect(() => {
    if (stepIndex === 6) {
      if (templateTimerRef.current) clearTimeout(templateTimerRef.current);
      templateTimerRef.current = setTimeout(() => {
        loadTemplates(agentName);
      }, 350);
    }
    return () => {
      if (templateTimerRef.current) clearTimeout(templateTimerRef.current);
    };
  }, [stepIndex, agentName, loadTemplates]);

  const currentSection = SECTIONS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === SECTIONS.length - 1;

  // Handle Skip / Dismiss
  const handleSkip = () => {
    Alert.alert(
      'Lewati Quickstart?',
      'Pengaturan default akan diterapkan. Anda dapat mengubah konfigurasi ini kapan saja melalui menu Pengaturan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lewati',
          style: 'destructive',
          onPress: async () => {
            try {
              await onboarding.dismissQuickstart(currentSection.key);
              router.reset(ROUTES.chat);
            } catch (err) {
              Alert.alert('Gagal Melewati', err?.message || 'Terjadi kesalahan jaringan.');
            }
          },
        },
      ]
    );
  };

  // Build the complete atomic payload
  const buildPayload = () => {
    const modelPayload = modelMode === 'existing'
      ? { mode: 'existing', value: existingProvider || stateData?.model_providers?.[0] || 'copilot.default' }
      : {
          mode: 'fresh',
          value: {
            provider_type: providerType,
            alias: providerAlias.trim() || 'default',
            model: providerModel.trim() || 'gpt-4o',
            fields: dynamicFields,
          },
        };

    const personalityList = Object.entries(personalityFiles)
      .filter(([_, content]) => Boolean(content && content.trim()))
      .map(([filename, content]) => ({ filename, content }));

    return {
      model_provider: modelPayload,
      risk_profile: { mode: 'existing', value: riskValue },
      runtime_profile: { mode: 'existing', value: runtimeValue },
      memory: { mode: 'fresh', value: memoryValue },
      channels: channelsList,
      peer_groups: [],
      agent: {
        name: agentName.trim() || 'Ai-Chan',
        system_prompt: systemPrompt.trim(),
        personality_file: null,
        personality_files: personalityList,
      },
    };
  };

  // Handle Finish Submission atomically without double LoadingOverlay flicker
  const handleFinish = async () => {
    setErrorBanner(null);
    setSubmitting(true);
    const payload = buildPayload();

    try {
      const result = await onboarding.submitQuickstart(payload);
      setSubmitting(false);

      if (!result.ok && result.errors && result.errors.length > 0) {
        const errorText = result.errors.map((e) => `• [${e.step}] ${e.message}`).join('\n');
        setErrorBanner(errorText);
        Alert.alert('Validasi Konfigurasi Gagal', errorText);
        return;
      }

      router.reset(ROUTES.chat);
    } catch (err) {
      setSubmitting(false);
      const msg = err?.message || 'Terjadi kesalahan saat menerapkan konfigurasi.';
      setErrorBanner(msg);
      Alert.alert('Gagal Menerapkan Quickstart', msg);
    }
  };

  // Render Step 1: Model Provider
  const renderModelProviderStep = () => {
    const existingProviders = stateData?.model_providers || [];
    const providerTypes = stateData?.model_provider_types || [];
    const cachedFields = onboarding.fieldsCache?.[`model_provider:${providerType}`] || [];

    return (
      <View style={styles.stepContent}>
        {existingProviders.length > 0 && (
          <View style={styles.tabSelector}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.tabButton, modelMode === 'existing' && styles.tabButtonActive]}
              onPress={() => setModelMode('existing')}>
              <Text style={[styles.tabText, modelMode === 'existing' && styles.tabTextActive]}>
                Gunakan yang Ada ({existingProviders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.tabButton, modelMode === 'fresh' && styles.tabButtonActive]}
              onPress={() => setModelMode('fresh')}>
              <Text style={[styles.tabText, modelMode === 'fresh' && styles.tabTextActive]}>
                Tambah Baru
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {modelMode === 'existing' && existingProviders.length > 0 ? (
          <View style={styles.cardGroup}>
            <Text style={styles.groupLabel}>Pilih Provider Tersedia:</Text>
            {existingProviders.map((ep) => (
              <TouchableOpacity
                key={ep}
                activeOpacity={0.7}
                style={[styles.radioCard, existingProvider === ep && styles.radioCardSelected]}
                onPress={() => setExistingProvider(ep)}>
                <View style={styles.radioRow}>
                  <View style={[styles.radioCircle, existingProvider === ep && styles.radioCircleSelected]} />
                  <Text style={styles.cardTitle}>{ep}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.formGroup}>
            <Text style={styles.groupLabel}>Pilih Jenis Layanan AI:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {providerTypes.map((pt) => (
                <TouchableOpacity
                  key={pt.kind}
                  activeOpacity={0.7}
                  style={[styles.pill, providerType === pt.kind && styles.pillSelected]}
                  onPress={() => setProviderType(pt.kind)}>
                  <Text style={[styles.pillText, providerType === pt.kind && styles.pillTextSelected]}>
                    {pt.display_name || pt.kind}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Alias Konfigurasi</Text>
              <TextInput
                style={styles.input}
                value={providerAlias}
                onChangeText={setProviderAlias}
                placeholder="misal: primary"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Nama Model</Text>
              <TextInput
                style={styles.input}
                value={providerModel}
                onChangeText={setProviderModel}
                placeholder="misal: gpt-4o atau claude-3-5-sonnet"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>

            {cachedFields.map((f) => {
              if (f.key === 'model') return null; // Already rendered above
              return (
                <View key={f.key} style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    {f.label || f.key} {f.required ? '*' : ''}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={dynamicFields[f.key] || ''}
                    onChangeText={(val) => setDynamicFields((prev) => ({ ...prev, [f.key]: val }))}
                    placeholder={f.help ? f.help.slice(0, 45) + '...' : f.key}
                    placeholderTextColor="#666"
                    secureTextEntry={Boolean(f.is_secret)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {f.help && <Text style={styles.fieldHelp}>{f.help}</Text>}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // Render Step 2: Risk Profile
  const renderRiskStep = () => {
    const presets = stateData?.risk_presets || [
      { preset_name: 'locked_down', label: 'Locked Down', help: 'Aman maksimal, sandbox ketat.' },
      { preset_name: 'balanced', label: 'Balanced', help: 'Direkomendasikan untuk penggunaan harian.' },
      { preset_name: 'yolo', label: 'YOLO', help: 'Otonomi penuh tanpa pembatasan.' },
    ];

    return (
      <View style={styles.stepContent}>
        {presets.map((p) => {
          const selected = riskValue === p.preset_name;
          return (
            <TouchableOpacity
              key={p.preset_name}
              activeOpacity={0.7}
              style={[styles.radioCard, selected && styles.radioCardSelected]}
              onPress={() => setRiskValue(p.preset_name)}>
              <View style={styles.radioRow}>
                <View style={[styles.radioCircle, selected && styles.radioCircleSelected]} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{p.label || p.preset_name}</Text>
                  {p.help && <Text style={styles.cardHelp}>{p.help}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render Step 3: Runtime Profile
  const renderRuntimeStep = () => {
    const presets = stateData?.runtime_presets || [
      { preset_name: 'tight', label: 'Tight', help: 'Hemat token dan timeout cepat.' },
      { preset_name: 'balanced', label: 'Balanced', help: 'Pengaturan standar yang fleksibel.' },
      { preset_name: 'unbounded', label: 'Unbounded', help: 'Kapasitas maksimal tanpa batas interaksi.' },
    ];

    return (
      <View style={styles.stepContent}>
        {presets.map((p) => {
          const selected = runtimeValue === p.preset_name;
          return (
            <TouchableOpacity
              key={p.preset_name}
              activeOpacity={0.7}
              style={[styles.radioCard, selected && styles.radioCardSelected]}
              onPress={() => setRuntimeValue(p.preset_name)}>
              <View style={styles.radioRow}>
                <View style={[styles.radioCircle, selected && styles.radioCircleSelected]} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{p.label || p.preset_name}</Text>
                  {p.help && <Text style={styles.cardHelp}>{p.help}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render Step 4: Memory Backend
  const renderMemoryStep = () => {
    const kinds = stateData?.memory_kinds || ['sqlite', 'markdown', 'postgres', 'none'];

    return (
      <View style={styles.stepContent}>
        <Text style={styles.groupLabel}>Pilih Media Database Memori:</Text>
        {kinds.map((k) => {
          const selected = memoryValue === k;
          return (
            <TouchableOpacity
              key={k}
              activeOpacity={0.7}
              style={[styles.radioCard, selected && styles.radioCardSelected]}
              onPress={() => setMemoryValue(k)}>
              <View style={styles.radioRow}>
                <View style={[styles.radioCircle, selected && styles.radioCircleSelected]} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{k.toUpperCase()}</Text>
                  <Text style={styles.cardHelp}>
                    {k === 'sqlite' ? 'Direkomendasikan (Penyimpanan database relasional lokal cepat di Android).' : `Backend memori jenis ${k}.`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render Step 5: Channels (Optional)
  const renderChannelsStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Kanal Komunikasi Eksternal</Text>
        <Text style={styles.infoText}>
          Aplikasi MUSE Mobile dan Gateway ZeroClaw dapat berjalan mandiri tanpa saluran eksternal. Anda dapat melewati langkah ini atau menambahkannya nanti di Pengaturan.
        </Text>
      </View>
      <Text style={styles.emptyNotice}>Tidak ada saluran eksternal yang diwajibkan saat ini.</Text>
    </View>
  );

  // Render Step 6: Peer Groups (Optional)
  const renderPeerGroupsStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Kolaborasi Peer Groups</Text>
        <Text style={styles.infoText}>
          Peer groups digunakan untuk koordinasi inter-agen otonom tingkat lanjut. Konfigurasi ini opsional dan dapat diatur setelah inisialisasi awal.
        </Text>
      </View>
      <Text style={styles.emptyNotice}>Pengaturan grup siap dilompati.</Text>
    </View>
  );

  // Render Step 7: Agent Identity & Personality
  const renderAgentStep = () => {
    const tabs = ['SOUL.md', 'IDENTITY.md', 'USER.md'];

    return (
      <View style={styles.stepContent}>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Nama Agen *</Text>
          <TextInput
            style={styles.input}
            value={agentName}
            onChangeText={setAgentName}
            placeholder="Ai-Chan"
            placeholderTextColor="#666"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Instruksi Dasar (System Prompt)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={systemPrompt}
            onChangeText={setSystemPrompt}
            placeholder="Instruksi sistem..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>

        <Text style={[styles.groupLabel, { marginTop: 12 }]}>Berkas Kepribadian (Personality Files):</Text>
        <View style={styles.tabSelector}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              style={[styles.tabButton, activePersonalityTab === tab && styles.tabButtonActive]}
              onPress={() => setActivePersonalityTab(tab)}>
              <Text style={[styles.tabText, activePersonalityTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.markdownEditorContainer}>
          <TextInput
            style={[styles.input, styles.markdownInput]}
            value={personalityFiles[activePersonalityTab] || ''}
            onChangeText={(text) => setPersonalityFiles((prev) => ({ ...prev, [activePersonalityTab]: text }))}
            placeholder={`Isi ${activePersonalityTab}...`}
            placeholderTextColor="#666"
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
    );
  };

  const renderCurrentStepContent = () => {
    switch (stepIndex) {
      case 0:
        return renderModelProviderStep();
      case 1:
        return renderRiskStep();
      case 2:
        return renderRuntimeStep();
      case 3:
        return renderMemoryStep();
      case 4:
        return renderChannelsStep();
      case 5:
        return renderPeerGroupsStep();
      case 6:
        return renderAgentStep();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.keyboardContainer}>
      <View style={[styles.root, { paddingTop: Math.max(StatusBar.currentHeight || 0, insets.top) + 16 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Inisialisasi Gateway</Text>
            <Text style={styles.stepIndicator}>
              Langkah {stepIndex + 1} dari {SECTIONS.length} — {currentSection.title}
            </Text>
            <Text style={styles.stepSubtitle}>{currentSection.subtitle}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {errorBanner && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorBanner}</Text>
          </View>
        )}

        {/* Form Content Scrollable */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {renderCurrentStepContent()}
        </ScrollView>

        {/* Bottom Navigation with Safe Area Inset */}
        <View style={[styles.nav, { paddingBottom: Math.max(24, 16 + insets.bottom) }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.navButton, isFirst && styles.navButtonDisabled]}
            disabled={isFirst}
            onPress={() => {
              setErrorBanner(null);
              setStepIndex((i) => Math.max(0, i - 1));
            }}>
            <Text style={[styles.navText, isFirst && styles.navTextDisabled]}>Sebelumnya</Text>
          </TouchableOpacity>

          {isLast ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navButton, styles.navButtonSubmit]}
              disabled={submitting}
              onPress={handleFinish}>
              {submitting ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={[styles.navText, styles.navTextSubmit]}>Selesai & Terapkan</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navButton, styles.navButtonNext]}
              onPress={() => {
                setErrorBanner(null);
                setStepIndex((i) => Math.min(SECTIONS.length - 1, i + 1));
              }}>
              <Text style={[styles.navText, styles.navTextNext]}>Selanjutnya</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'OptimisticApp-Bold',
    marginBottom: 4,
  },
  stepIndicator: {
    color: '#3b82f6',
    fontSize: 14,
    fontFamily: 'OptimisticApp-Bold',
    marginBottom: 2,
  },
  stepSubtitle: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp',
  },
  skipButton: {
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  skipText: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp-Bold',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
  },
  errorBannerText: {
    color: '#f87171',
    fontSize: 13,
    fontFamily: 'OptimisticApp',
    lineHeight: 18,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  stepContent: {
    flex: 1,
  },
  groupLabel: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#2c2c2e',
  },
  tabText: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp-Bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  cardGroup: {
    marginBottom: 16,
  },
  radioCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  radioCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 14,
  },
  radioCircleSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OptimisticApp-Bold',
    marginBottom: 4,
  },
  cardHelp: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp',
    lineHeight: 18,
  },
  pillScroll: {
    marginBottom: 16,
  },
  pill: {
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  pillSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  pillText: {
    color: '#8e8e93',
    fontSize: 14,
    fontFamily: 'OptimisticApp-Bold',
  },
  pillTextSelected: {
    color: '#000',
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#e5e5ea',
    fontSize: 14,
    fontFamily: 'OptimisticApp-Bold',
    marginBottom: 8,
  },
  fieldHelp: {
    color: '#636366',
    fontSize: 12,
    fontFamily: 'OptimisticApp',
    marginTop: 4,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'OptimisticApp',
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  markdownEditorContainer: {
    marginTop: 8,
  },
  markdownInput: {
    minHeight: 180,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2c2c2e',
    marginBottom: 16,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'OptimisticApp-Bold',
    marginBottom: 6,
  },
  infoText: {
    color: '#8e8e93',
    fontSize: 13,
    fontFamily: 'OptimisticApp',
    lineHeight: 18,
  },
  emptyNotice: {
    color: '#636366',
    fontSize: 14,
    fontFamily: 'OptimisticApp',
    textAlign: 'center',
    marginVertical: 24,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1c1c1e',
  },
  navButton: {
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  navButtonNext: {
    backgroundColor: '#fff',
  },
  navButtonSubmit: {
    backgroundColor: '#3b82f6',
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'OptimisticApp-Bold',
  },
  navTextNext: {
    color: '#000',
  },
  navTextSubmit: {
    color: '#fff',
  },
  navTextDisabled: {
    color: '#636366',
  },
});
