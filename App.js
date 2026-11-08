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

// Entry only: providers, splash, fonts, and the router render.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { route, reset } = useRouter();
  const splashHidden = useRef(false);
  const initialChecked = useRef(false);
  const [hydrated, setHydrated] = useState(useStore.persist?.hasHydrated?.() ?? true);

  const checkStartupStatus = useStore((s) => s.connection.checkStartupStatus);

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
        if (fontsLoaded || fontError) hideSplash();
      });
  }, [hydrated, fontsLoaded, fontError, checkStartupStatus, reset, hideSplash]);

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
