import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Sora_400Regular, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from "@expo-google-fonts/sora";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { LoadingScreen } from "@/components/LoadingScreen";
import { COLORS } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  // `error` is surfaced so a font-load failure doesn't trap the user on the
  // loading screen forever — we treat "loaded OR errored" as "fonts settled".
  const [fontsLoaded, fontError] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const fontsSettled = fontsLoaded || !!fontError;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    // Reveal the app once fonts settle and the Jesse intro has had time to
    // play. A hard 4s ceiling guarantees we never get stuck on the loading
    // screen even if font loading hangs on a slow device.
    const intro = fontsSettled ? setTimeout(() => setReady(true), 2800) : undefined;
    const ceiling = setTimeout(() => setReady(true), 4000);
    return () => {
      if (intro) clearTimeout(intro);
      clearTimeout(ceiling);
    };
  }, [fontsSettled]);

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="question" />
        <Stack.Screen name="email" />
        <Stack.Screen name="results" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="day" />
      </Stack>
    </SafeAreaProvider>
  );
}
