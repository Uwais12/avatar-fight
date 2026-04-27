import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useGame } from "../lib/store";
import { theme } from "../lib/theme";

export default function RootLayout() {
  const ensureOpponents = useGame((s) => s.ensureOpponents);
  const hydrated = useGame((s) => s.hydrated);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  useEffect(() => {
    if (hydrated) ensureOpponents();
  }, [hydrated, ensureOpponents]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.parchment },
          headerTintColor: theme.ink,
          headerTitleStyle: { fontWeight: "900" },
          contentStyle: { backgroundColor: theme.parchment },
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="arena" options={{ headerShown: false }} />
        <Stack.Screen name="me" options={{ headerShown: false }} />
        <Stack.Screen name="bag" options={{ headerShown: false }} />
        <Stack.Screen name="shop" options={{ headerShown: false }} />
        <Stack.Screen name="guild" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false, presentation: "transparentModal", animation: "fade" }} />
        <Stack.Screen name="battle" options={{ headerShown: false, presentation: "fullScreenModal", animation: "fade" }} />
        <Stack.Screen name="equipment" options={{ headerShown: false }} />
        <Stack.Screen name="pets" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
