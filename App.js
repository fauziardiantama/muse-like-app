import { useCallback, useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, View } from 'react-native';
import { ROUTES, RouterProvider, useRouter } from './navigation/router';
import { decideInitialRoute } from './navigation/initialCheck';
import { useStore } from './store';
import { setClientBaseUrl, setAuthToken } from './api/client';
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

  const connection = useStore((s) => s.connection);
  const onboarding = useStore((s) => s.onboarding);

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
    if (connection.baseUrl) {
      setClientBaseUrl(connection.baseUrl);
    }
    if (connection.authToken) {
      setAuthToken(connection.authToken);
    }

    if (!initialChecked.current) {
      const hasToken = connection.paired && Boolean(connection.authToken);
      if (hasToken) {
        initialChecked.current = true;
        const targetRoute = decideInitialRoute({
          hasToken: true,
          quickstartCompleted: onboarding.quickstartCompleted,
        });
        reset(targetRoute);
      }
    }
  }, [connection.paired, connection.authToken, connection.baseUrl, onboarding.quickstartCompleted, reset]);

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
