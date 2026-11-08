import { useState } from 'react';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from '../navigation/router';
import { decideInitialRoute } from '../navigation/initialCheck';
import { useStore } from '../store';

// Token page (awal flow). Layout, in order: upload file .token admin,
// the word "atau" centered between the two ways in, pair-key input,
// submit button.
// Visual only for now, like the other placeholder buttons in this
// app: the upload button does not open a file picker yet (no picker
// dependency installed), it just marks a file as chosen locally, and
// submit does not call /pair yet. Submit only does what Farid
// specified: redirect to the start, and the start's initial check
// (decideInitialRoute) decides token -> quickstart -> chat. The
// token value itself is never stored: presence is connection.paired,
// the pair-key text stays local to this screen and is discarded.
// If neither a file nor a key is given, paired stays false, so the
// initial check lands back on this page.
export default function TokenScreen() {
  const { reset } = useRouter();
  const setPaired = useStore((s) => s.connection.setPaired);
  const quickstartCompleted = useStore((s) => s.onboarding.quickstartCompleted);
  const [fileChosen, setFileChosen] = useState(false);
  const [pairKey, setPairKey] = useState('');

  const onSubmit = () => {
    const hasToken = fileChosen || pairKey.trim().length > 0;
    setPaired(hasToken);
    reset(decideInitialRoute({ hasToken, quickstartCompleted }));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Token</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.uploadBox}
        onPress={() => setFileChosen(true)}>
        <Text style={styles.uploadText}>
          {fileChosen ? 'admin.token dipilih' : 'Pilih file .token admin'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.or}>atau</Text>
      <TextInput
        style={styles.input}
        value={pairKey}
        onChangeText={setPairKey}
        placeholder="Pair key"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity activeOpacity={0.7} style={styles.submit} onPress={onSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16, paddingTop: (StatusBar.currentHeight || 0) + 24 },
  title: { color: '#fff', fontSize: 20, fontFamily: 'OptimisticApp-Bold', marginBottom: 24 },
  uploadBox: { backgroundColor: '#262626', borderRadius: 24, paddingVertical: 20, alignItems: 'center' },
  uploadText: { color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  or: { color: '#888', fontSize: 16, fontFamily: 'OptimisticApp', textAlign: 'center', marginVertical: 16 },
  input: { backgroundColor: '#262626', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 16, fontFamily: 'OptimisticApp' },
  submit: { backgroundColor: '#fff', borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#000', fontSize: 16, fontFamily: 'OptimisticApp-Bold' },
});
