import { useCallback, useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, View } from 'react-native';
import { ROUTES, RouterProvider, useRouter } from './navigation/router';
import { decideInitialRoute } from './navigation/initialCheck';
import { useStore } from './store';
import { setClientBaseUrl, setAuthToken, verifyAuthToken } from './api/client';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';
import TokenScreen from './screens/TokenScreen';
import QuickstartScreen from './screens/QuickstartScreen';

// Entry only: providers, splash, fonts, and the router render.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { route, reset } = useRouter();
  const splashHidden = useRef(false);
  const initialChecked = useRef(false);
  const [hydrated, setHydrated] = useState(useStore.persist?.hasHydrated?.() ?? true);

  const connection = useStore((s) => s.connection);
  const onboarding = useStore((s) => s.onboarding);

  useEffect(() => {
    if (useStore.persist?.onFinishHydration) {
      const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
      if (useStore.persist.hasHydrated()) setHydrated(true);
      return unsub;
    }
  }, []);

  const hideSplash = useCallback(async () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    try {
      await SplashScreen.hideAsync();
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(hideSplash, 3000);
    return () => clearTimeout(t);
  }, [hideSplash]);

  const [fontsLoaded, fontError] = Font.useFonts({
    'OptimisticApp': require('./assets/fonts/OptimisticApp-Regular.ttf'),
    'OptimisticApp-Medium': require('./assets/fonts/OptimisticApp-Medium.ttf'),
    'OptimisticApp-Bold': require('./assets/fonts/OptimisticApp-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) hideSplash();
  }, [fontsLoaded, fontError, hideSplash]);

  // Sinkronisasi data tersimpan & auto-redirect rute awal saat aplikasi dibuka
  useEffect(() => {
    if (!hydrated) return;

    if (connection.baseUrl) {
      setClientBaseUrl(connection.baseUrl);
    }
    if (connection.authToken) {
      setAuthToken(connection.authToken);
    }

    if (!initialChecked.current) {
      const storedToken = connection.authToken;
      const storedUrl = connection.baseUrl;

      if (!storedToken) {
        initialChecked.current = true;
        reset(ROUTES.token);
        return;
      }

      // Verifikasi aktif: pastikan token ada DAN work di server
      initialChecked.current = true;
      verifyAuthToken(storedToken, storedUrl)
        .then(() => {
          const targetRoute = decideInitialRoute({
            hasToken: true,
            quickstartCompleted: onboarding.quickstartCompleted,
          });
          reset(targetRoute);
        })
        .catch((err) => {
          if (err?.status === 401 || err?.kind === 'unauthorized') {
            useStore.getState().connection.setAuthToken(null);
            useStore.getState().connection.setError('Sesi autentikasi telah kedaluwarsa atau token tidak valid. Silakan pasangkan ulang.');
          } else {
            useStore.getState().connection.setError(err?.message || 'Gagal terhubung ke gateway.');
          }
          reset(ROUTES.token);
        });
    }
  }, [hydrated, connection.authToken, connection.baseUrl, onboarding.quickstartCompleted, reset]);

  return (
    <View style={styles.root} onLayout={hideSplash}>
      <StatusBar style="light" />
      {route === ROUTES.token ? (
        <TokenScreen />
      ) : route === ROUTES.quickstart ? (
        <QuickstartScreen />
      ) : route === ROUTES.settings ? (
        <SettingsScreen />
      ) : (
        <ChatScreen />
      )}
    </View>
  );
}

export default function App() {
  return (
    <KeyboardProvider preload={false}>
      <SafeAreaProvider>
        <RouterProvider>
          <AppShell />
        </RouterProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
});
