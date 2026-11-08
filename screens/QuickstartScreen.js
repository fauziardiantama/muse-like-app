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
  const [providerAlias, setProviderAlias] = useState('');
  const [providerModel, setProviderModel] = useState('');
  const [dynamicFields, setDynamicFields] = useState({});

  // --- Step 2: Risk Profile State ---
  const [riskValue, setRiskValue] = useState('balanced');

  // --- Step 3: Runtime Profile State ---
  const [runtimeValue, setRuntimeValue] = useState('unbounded');

  // --- Step 4: Memory State ---
  const [memoryValue, setMemoryValue] = useState('sqlite');

  // --- Step 5: Channels State ---
  const [channelsList, setChannelsList] = useState([]);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [channelType, setChannelType] = useState('');
  const [channelAlias, setChannelAlias] = useState('');
  const [channelFields, setChannelFields] = useState({});

  // --- Step 6: Peer Groups State ---
  const [peerGroupsList, setPeerGroupsList] = useState([]);
  const [showAddPeerGroup, setShowAddPeerGroup] = useState(false);
  const [peerGroupChannel, setPeerGroupChannel] = useState('');
  const [peerGroupName, setPeerGroupName] = useState('');
  const [peerGroupPeers, setPeerGroupPeers] = useState('');

  // --- Step 7: Agent Identity & Personality State ---
  const [agentName, setAgentName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
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

  // Fetch dynamic fields when switching channel type
  useEffect(() => {
    if (channelType) {
      onboarding.fetchSectionFields('channels', channelType);
    }
  }, [channelType]);

  // Fetch personality templates when entering Step 7 (pure ZeroClaw defaults without custom prefill)
  const loadTemplates = useCallback((targetName) => {
    const params = {};
    if (targetName && targetName.trim()) {
      params.agent_name = targetName.trim();
    }
    onboarding.fetchPersonalityTemplates(params).then((res) => {
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
      channels: channelsList.map((c) =>
        c.mode === 'existing'
          ? { mode: 'existing', value: `${c.channel_type}.${c.alias}` }
          : {
              mode: 'fresh',
              value: {
                channel_type: c.channel_type,
                alias: c.alias,
                fields: c.fields || {},
              },
            }
      ),
      peer_groups: peerGroupsList.map((pg) => ({
        name: pg.name,
        channel: pg.channel,
        external_peers: pg.external_peers || [],
      })),
      agent: {
        name: agentName.trim(),
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
                placeholder="misal: default"
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
    const presets = stateData?.risk_presets || [];

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
    const presets = stateData?.runtime_presets || [];

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
                  <Text style={styles.cardTitle}>{k}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render Step 5: Channels
  const renderChannelsStep = () => {
    const channelTypes = stateData?.channel_types || [];
    const cachedFields = onboarding.fieldsCache?.[`channels:${channelType}`] || [];

    const handleAddChannel = () => {
      if (!channelType || !channelAlias.trim()) {
        Alert.alert('Perhatian', 'Pilih jenis kanal dan isi alias kanal.');
        return;
      }
      setChannelsList((prev) => [
        ...prev,
        {
          mode: 'fresh',
          channel_type: channelType,
          alias: channelAlias.trim(),
          fields: channelFields,
        },
      ]);
      setChannelType('');
      setChannelAlias('');
      setChannelFields({});
      setShowAddChannel(false);
    };

    const handleRemoveChannel = (idx) => {
      const removed = channelsList[idx];
      const removedKey = removed ? `${removed.channel_type}.${removed.alias}` : null;
      setChannelsList((prev) => prev.filter((_, i) => i !== idx));
      if (removedKey) {
        setPeerGroupsList((prev) => prev.filter((pg) => pg.channel !== removedKey));
      }
    };

    return (
      <View style={styles.stepContent}>
        {channelsList.length > 0 && (
          <View style={styles.cardGroup}>
            <Text style={styles.groupLabel}>Kanal Terkonfigurasi ({channelsList.length}):</Text>
            {channelsList.map((c, i) => (
              <View key={`${c.channel_type}.${c.alias}.${i}`} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{c.channel_type}.{c.alias}</Text>
                  <Text style={styles.itemSubtitle}>Mode: {c.mode}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                  onPress={() => handleRemoveChannel(i)}>
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {showAddChannel ? (
          <View style={styles.formGroup}>
            <Text style={styles.groupLabel}>Pilih Jenis Kanal:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {channelTypes.map((ct) => (
                <TouchableOpacity
                  key={ct.kind}
                  activeOpacity={0.7}
                  style={[styles.pill, channelType === ct.kind && styles.pillSelected]}
                  onPress={() => setChannelType(ct.kind)}>
                  <Text style={[styles.pillText, channelType === ct.kind && styles.pillTextSelected]}>
                    {ct.display_name || ct.kind}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Alias Kanal *</Text>
              <TextInput
                style={styles.input}
                value={channelAlias}
                onChangeText={setChannelAlias}
                placeholder="misal: main atau alerts"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>

            {cachedFields.map((f) => (
              <View key={f.key} style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {f.label || f.key} {f.required ? '*' : ''}
                </Text>
                <TextInput
                  style={styles.input}
                  value={channelFields[f.key] || ''}
                  onChangeText={(val) => setChannelFields((prev) => ({ ...prev, [f.key]: val }))}
                  placeholder={f.help ? f.help.slice(0, 45) + '...' : f.key}
                  placeholderTextColor="#666"
                  secureTextEntry={Boolean(f.is_secret)}
                  autoCapitalize="none"
                />
                {f.help && <Text style={styles.fieldHelp}>{f.help}</Text>}
              </View>
            ))}

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.actionBtn, styles.actionBtnCancel]}
                onPress={() => setShowAddChannel(false)}>
                <Text style={styles.actionBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.actionBtn, styles.actionBtnSave]}
                onPress={handleAddChannel}>
                <Text style={[styles.actionBtnText, styles.actionBtnSaveText]}>Simpan Kanal</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addButton}
            onPress={() => setShowAddChannel(true)}>
            <Text style={styles.addButtonText}>+ Tambah Kanal Komunikasi</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render Step 6: Peer Groups
  const renderPeerGroupsStep = () => {
    const availableChannels = channelsList.map((c) => `${c.channel_type}.${c.alias}`);

    const handleAddPeerGroup = () => {
      const selectedChannel = peerGroupChannel || availableChannels[0];
      if (!selectedChannel) {
        Alert.alert('Perhatian', 'Pilih kanal untuk peer group.');
        return;
      }
      const defaultName = `${selectedChannel.replace('.', '_')}_default`;
      const finalName = peerGroupName.trim() || defaultName;
      const peers = peerGroupPeers
        .split(/[\n,]/)
        .map((p) => p.trim())
        .filter(Boolean);

      setPeerGroupsList((prev) => [
        ...prev,
        {
          name: finalName,
          channel: selectedChannel,
          external_peers: peers,
        },
      ]);
      setPeerGroupName('');
      setPeerGroupPeers('');
      setShowAddPeerGroup(false);
    };

    const handleRemovePeerGroup = (idx) => {
      setPeerGroupsList((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
      <View style={styles.stepContent}>
        {availableChannels.length === 0 ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Belum Ada Kanal Terkonfigurasi</Text>
            <Text style={styles.infoText}>
              Peer groups menghubungkan percakapan multi-agen melalui kanal eksternal. Silakan tambahkan kanal di Langkah 5 terlebih dahulu jika ingin mengonfigurasi peer group, atau langsung lanjut ke langkah berikutnya.
            </Text>
          </View>
        ) : (
          <>
            {peerGroupsList.length > 0 && (
              <View style={styles.cardGroup}>
                <Text style={styles.groupLabel}>Peer Groups Terkonfigurasi ({peerGroupsList.length}):</Text>
                {peerGroupsList.map((pg, i) => (
                  <View key={`${pg.name}.${i}`} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{pg.name}</Text>
                      <Text style={styles.itemSubtitle}>
                        Kanal: {pg.channel} · {pg.external_peers.length > 0 ? `${pg.external_peers.length} peers` : 'Semua peer'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.deleteButton}
                      onPress={() => handleRemovePeerGroup(i)}>
                      <Text style={styles.deleteButtonText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {showAddPeerGroup ? (
              <View style={styles.formGroup}>
                <Text style={styles.groupLabel}>Pilih Kanal Pengait:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {availableChannels.map((ac) => {
                    const isSelected = (peerGroupChannel || availableChannels[0]) === ac;
                    return (
                      <TouchableOpacity
                        key={ac}
                        activeOpacity={0.7}
                        style={[styles.pill, isSelected && styles.pillSelected]}
                        onPress={() => setPeerGroupChannel(ac)}>
                        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                          {ac}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Nama Peer Group</Text>
                  <TextInput
                    style={styles.input}
                    value={peerGroupName}
                    onChangeText={setPeerGroupName}
                    placeholder="misal: admins"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>External Peers (Opsional, pisahkan koma atau baris baru)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={peerGroupPeers}
                    onChangeText={setPeerGroupPeers}
                    placeholder="@alice&#10;@bob"
                    placeholderTextColor="#666"
                    multiline
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.actionBtn, styles.actionBtnCancel]}
                    onPress={() => setShowAddPeerGroup(false)}>
                    <Text style={styles.actionBtnText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.actionBtn, styles.actionBtnSave]}
                    onPress={handleAddPeerGroup}>
                    <Text style={[styles.actionBtnText, styles.actionBtnSaveText]}>Simpan Grup</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.addButton}
                onPress={() => setShowAddPeerGroup(true)}>
                <Text style={styles.addButtonText}>+ Tambah Peer Group</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

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
            placeholder="Nama agen (misal: Ai-Chan)..."
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
            placeholder="Instruksi sistem / system prompt..."
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'OptimisticApp-Bold',
  },
  itemSubtitle: {
    color: '#8e8e93',
    fontSize: 12,
    fontFamily: 'OptimisticApp',
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'OptimisticApp-Bold',
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    marginVertical: 12,
  },
  addButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontFamily: 'OptimisticApp-Bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnCancel: {
    backgroundColor: '#2c2c2e',
  },
  actionBtnSave: {
    backgroundColor: '#3b82f6',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'OptimisticApp-Bold',
  },
  actionBtnSaveText: {
    color: '#fff',
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
