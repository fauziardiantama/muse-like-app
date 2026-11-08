import { useCallback, useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, View } from 'react-native';
import { ROUTES, RouterProvider, useRouter } from './navigation/router';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';

// Entry only: providers, splash, fonts, and the router render.
// No page logic lives here. Chat lives in screens/ChatScreen.js,
// Settings lives in screens/SettingsScreen.js, routing lives in
// navigation/router.js. A new page is a new screens/ file plus a
// route name, not more code in this file.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { route } = useRouter();
  const splashHidden = useRef(false);

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

  return (
    <View style={styles.root} onLayout={hideSplash}>
      <StatusBar style="light" />
      {route === ROUTES.settings ? <SettingsScreen /> : <ChatScreen />}
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
