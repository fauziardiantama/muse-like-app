import { useCallback, useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, View } from 'react-native';
import { ROUTES, RouterProvider, useRouter } from './navigation/router';
import { useStore } from './store';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';
import TokenScreen from './screens/TokenScreen';
import QuickstartScreen from './screens/QuickstartScreen';
import LoadingOverlay from './components/LoadingOverlay';

// Entry only: providers, splash, fonts, and the router render.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { route, reset } = useRouter();
  const splashHidden = useRef(false);
  const initialChecked = useRef(false);
  const [hydrated, setHydrated] = useState(useStore.persist?.hasHydrated?.() ?? true);
  const [isReady, setIsReady] = useState(false);

  const checkStartupStatus = useStore((s) => s.connection.checkStartupStatus);
  const connectionLoading = useStore((s) => s.connection.loading);
  const onboardingLoading = useStore((s) => s.onboarding.loading);
  const isGlobalLoading = connectionLoading || onboardingLoading;

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

  const [fontsLoaded, fontError] = Font.useFonts({
    'OptimisticApp': require('./assets/fonts/OptimisticApp-Regular.ttf'),
    'OptimisticApp-Medium': require('./assets/fonts/OptimisticApp-Medium.ttf'),
    'OptimisticApp-Bold': require('./assets/fonts/OptimisticApp-Bold.ttf'),
  });

  const isAppReady = isReady && (fontsLoaded || fontError);

  // Safety fallback: pastikan splash screen tidak pernah stuck selamanya
  useEffect(() => {
    const t = setTimeout(() => {
      setIsReady(true);
      hideSplash();
    }, 5000);
    return () => clearTimeout(t);
  }, [hideSplash]);

  // Delegasikan pengecekan status awal dan penentuan rute ke store action
  useEffect(() => {
    if (!hydrated || initialChecked.current) return;
    initialChecked.current = true;

    checkStartupStatus()
      .then((targetRoute) => {
        reset(targetRoute);
      })
      .catch(() => {
        reset(ROUTES.token);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, [hydrated, checkStartupStatus, reset]);

  // Hanya sembunyikan splash setelah app benar-benar siap dan rute awal telah terkunci
  useEffect(() => {
    if (isAppReady) {
      hideSplash();
    }
  }, [isAppReady, hideSplash]);

  const onRootLayout = useCallback(() => {
    if (isAppReady) {
      hideSplash();
    }
  }, [isAppReady, hideSplash]);

  // Selama inisialisasi awal belum selesai, render loading screen solid
  // agar tidak ada sekelibat tampilan TokenScreen sebelum target route ditetapkan
  if (!isAppReady) {
    return (
      <View style={styles.root} onLayout={onRootLayout}>
        <StatusBar style="light" />
        <LoadingOverlay visible={true} />
      </View>
    );
  }

  return (
    <View style={styles.root} onLayout={onRootLayout}>
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
      <LoadingOverlay visible={isGlobalLoading} />
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
