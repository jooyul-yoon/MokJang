import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import * as AppleAuthentication from "expo-apple-authentication";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession(); // Required for web only

const REDIRECT_URI = "mokjang://google-auth";
const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

const performOAuth = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        prompt: "select_account",
        access_type: "offline",
      },
      redirectTo: REDIRECT_URI,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);

  if (res.type === "success") {
    const { url } = res;
    await createSessionFromUrl(url);
  }
};

const handleAppleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    // Sign in via Supabase Auth.
    if (credential.identityToken) {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (error) throw error;
      // Session is handled by onAuthStateChange in _layout.tsx
    }
  } catch (e: any) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      // handle that the user canceled the sign-in flow
    } else {
      console.error(e);
    }
  }
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/images/logo-dark.png")
      : require("@/assets/images/logo-light.png");

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-background-dark">
      <Box className="flex-1 px-6">
        {/* Main Content - Centered */}
        <VStack className="flex-1 items-center justify-center">
          <Image
            source={logoSource}
            style={{ width: 200, height: 60 }}
            contentFit="contain"
          />
          <Text className="text-center text-lg text-slate-500 dark:text-typography-400">
            {t("login.welcomeSubtitle")}
          </Text>
        </VStack>

        {/* Bottom Auth Buttons */}
        <VStack className="w-full gap-4 pb-12 pt-4">
          <TouchableOpacity
            onPress={performOAuth}
            className="h-[52px] w-full flex-row items-center justify-center gap-2 rounded-xl border border-slate-400"
            activeOpacity={0.6}
          >
            <Image
              source={require("@/assets/images/g.png")}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />

            <Text
              className="font-medium text-slate-900 dark:text-typography-100"
              style={{ fontSize: 20 }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && (
            <Box className="w-full">
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
                }
                buttonStyle={
                  colorScheme === "dark"
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={12}
                style={{ width: "100%", height: 52 }}
                onPress={handleAppleSignIn}
              />
            </Box>
          )}
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
