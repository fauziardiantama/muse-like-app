import { useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from '../navigation/router';
import { decideInitialRoute } from '../navigation/initialCheck';
import { useStore } from '../store';
import { pair, setClientBaseUrl, setAuthToken as setApiAuthToken, verifyAuthToken } from '../api/client';

export default function TokenScreen() {
  const { reset } = useRouter();
  const currentBaseUrl = useStore((s) => s.connection.baseUrl);
  const connectionError = useStore((s) => s.connection.error);
  const setBaseUrl = useStore((s) => s.connection.setBaseUrl);
  const setAuthToken = useStore((s) => s.connection.setAuthToken);
  const setConnectionError = useStore((s) => s.connection.setError);
  const quickstartCompleted = useStore((s) => s.onboarding.quickstartCompleted);

  const [serverUrl, setServerUrl] = useState(currentBaseUrl || 'http://localhost:3000');
  const [pairKey, setPairKey] = useState('');
  const [chosenFileName, setChosenFileName] = useState('');
  const [chosenToken, setChosenToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const clearErrors = () => {
    if (errorMessage) setErrorMessage('');
    if (connectionError) setConnectionError(null);
  };

  const onPickFile = async () => {
    clearErrors();
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || !res.assets.length) {
        return;
      }

      const asset = res.assets[0];
      const content = await FileSystem.readAsStringAsync(asset.uri);
      const token = content.trim();

      if (!token) {
        setErrorMessage('File token kosong.');
        return;
      }

      setChosenToken(token);
      setChosenFileName(asset.name || 'admin.token');
    } catch (err) {
      setErrorMessage('Gagal membaca file: ' + (err.message || String(err)));
    }
  };

  const onSubmit = async () => {
    setErrorMessage('');
    const trimmedUrl = serverUrl.trim().replace(/\/+$/, '');
    if (!trimmedUrl) {
      setErrorMessage('URL server tidak boleh kosong.');
      return;
    }

    const trimmedKey = pairKey.trim();

    // 1. Prioritas Utama: Pair Key
    if (trimmedKey) {
      setLoading(true);
      try {
        setClientBaseUrl(trimmedUrl);
        const { token } = await pair(trimmedKey, trimmedUrl);

        if (!token) {
          throw new Error('Server tidak mengembalikan token auth.');
        }

        setBaseUrl(trimmedUrl);
        setAuthToken(token);
        setApiAuthToken(token);
        reset(decideInitialRoute({ hasToken: true, quickstartCompleted }));
      } catch (err) {
        const msg = err.message || (err.kind === 'forbidden' ? 'Kode pairing tidak valid atau kedaluwarsa' : 'Gagal terhubung ke gateway');
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Jalur Berkas admin.token
    if (chosenToken) {
      setLoading(true);
      try {
        setClientBaseUrl(trimmedUrl);
        await verifyAuthToken(chosenToken, trimmedUrl);
        setBaseUrl(trimmedUrl);
        setAuthToken(chosenToken);
        setApiAuthToken(chosenToken);
        reset(decideInitialRoute({ hasToken: true, quickstartCompleted }));
      } catch (err) {
        const msg = err.message || (err.kind === 'unauthorized' ? 'Token admin tidak valid atau ditolak oleh gateway' : 'Gagal terhubung ke gateway');
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    setErrorMessage('Masukkan Pair key atau pilih berkas admin.token.');
  };

  const displayError = errorMessage || connectionError;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Token</Text>

      <Text style={styles.fieldLabel}>Gateway URL</Text>
      <TextInput
        style={styles.input}
        value={serverUrl}
        onChangeText={(val) => {
          clearErrors();
          setServerUrl(val);
        }}
        placeholder="http://192.168.1.x:3000"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={{ height: 16 }} />

      <Text style={styles.fieldLabel}>Admin Token</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.uploadBox}
        onPress={onPickFile}>
        <Text style={styles.uploadText}>
          {chosenFileName ? `${chosenFileName} dipilih` : 'Pilih file .token admin'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.or}>atau</Text>

      <Text style={styles.fieldLabel}>Pair Key</Text>
      <TextInput
        style={styles.input}
        value={pairKey}
        onChangeText={(val) => {
          clearErrors();
          setPairKey(val);
        }}
        placeholder="Pair key (32 karakter)"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {Boolean(displayError) && (
        <Text style={styles.errorText}>{displayError}</Text>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.submit, loading && styles.submitDisabled]}
        disabled={loading}
        onPress={onSubmit}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 0) + 24,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'OptimisticApp-Bold',
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'OptimisticApp',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OptimisticApp',
  },
  uploadBox: {
    backgroundColor: '#262626',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OptimisticApp',
  },
  or: {
    color: '#888',
    fontSize: 16,
    fontFamily: 'OptimisticApp',
    textAlign: 'center',
    marginVertical: 14,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 14,
    fontFamily: 'OptimisticApp',
    marginTop: 12,
    textAlign: 'center',
  },
  submit: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'OptimisticApp-Bold',
  },
});
