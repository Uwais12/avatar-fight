import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useGame } from "../lib/store";
import { theme } from "../lib/theme";

export default function RootLayout() {
  const ensureOpponents = useGame((s) => s.ensureOpponents);
  const hydrated = useGame((s) => s.hydrated);

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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="me" options={{ title: "MY HERO", presentation: "card" }} />
        <Stack.Screen name="equipment" options={{ title: "EQUIPMENT" }} />
        <Stack.Screen name="shop" options={{ title: "FORGE" }} />
        <Stack.Screen name="pets" options={{ title: "PETS" }} />
        <Stack.Screen name="battle" options={{ headerShown: false, presentation: "fullScreenModal", animation: "fade" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
