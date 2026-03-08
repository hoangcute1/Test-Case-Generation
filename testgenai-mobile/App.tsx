import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { useAuthStore } from "./src/store/authStore";
import RootNavigator from "./src/navigation/RootNavigator";
import { LoadingView } from "./src/components/ui/StateViews";

const queryClient = new QueryClient();

function AppContent() {
  const { isDark } = useTheme();
  const initAuth = useAuthStore((s) => s.initAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initAuth().finally(() => setReady(true));
  }, [initAuth]);

  if (!ready) return <LoadingView message="Loading..." />;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
