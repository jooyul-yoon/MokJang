import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import "@/i18n";
import { queryClient } from "@/lib/react-query";
import { supabase } from "@/lib/supabase";
import { updatePushToken } from "@/services/pushTokenApi";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";

export function useNotificationObserver() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const isReady = !!rootNavigationState?.key;
  const pendingUrl = useRef<string | null>(null);

  const performRedirect = (url: string) => {
    if (isReady) {
      setTimeout(() => {
        router.push(url as any);
        pendingUrl.current = null;
      }, 100);
    } else {
      pendingUrl.current = url;
    }
  };

  useEffect(() => {
    // 1. Cold Start: 앱이 꺼진 상태에서 알림 클릭
    const response = Notifications.getLastNotificationResponse();
    if (response) {
      const url = response.notification.request.content.data?.url;
      if (url) performRedirect(url as string);
    }

    // 2. 알림 클릭 리스너: 앱이 켜져 있을 때
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url;
        if (url) performRedirect(url as string);
      },
    );

    return () => subscription.remove();
  }, [isReady]); // isReady(준비 상태)가 바뀔 때마다 체크

  // 3. 준비가 끝난 시점에 대기 중인 URL이 있다면 이동
  useEffect(() => {
    if (isReady && pendingUrl.current) {
      performRedirect(pendingUrl.current);
    }
  }, [isReady]);
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Push notifications
  const { expoPushToken } = usePushNotifications();
  useNotificationObserver();

  useEffect(() => {
    if (expoPushToken) {
      updatePushToken(expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inLogin = segments[0] === "login"; // Direct route check

    if (!session && !inLogin) {
      // Redirect to the sign-in page.
      router.replace("/login");
    } else if (session && inLogin) {
      // Redirect away from the sign-in page.
      router.replace("/(tabs)");
    }
  }, [session, initialized, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode={(colorScheme as "light" | "dark") || "system"}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}
