import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { AntDesign } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

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

  return (
    <VStack className="flex-1 items-center justify-center bg-background-light p-4 dark:bg-background-dark">
      <Text className="mb-8 text-3xl font-bold text-typography-black dark:text-typography-white">
        MokJang
      </Text>
      <Button
        onPress={performOAuth}
        className="h-[44px] w-full max-w-[320px] flex-row items-center justify-center gap-3 rounded-md border border-black bg-white hover:bg-gray-100 dark:border-white dark:hover:bg-gray-800"
      >
        <AntDesign name="google" size={20} color="black" />
        <ButtonText className="text-lg font-medium text-gray-800">
          {t("login.signInWithGoogle")}
        </ButtonText>
      </Button>

      {Platform.OS === "ios" && (
        <Button
          onPress={handleAppleSignIn}
          className="mt-3 h-[44px] w-full max-w-[320px] flex-row items-center justify-center gap-3 rounded-md border-outline-100 bg-black dark:border"
        >
          <AntDesign name="apple" size={20} color="white" />
          <ButtonText className="text-lg font-medium text-white">
            {t("login.signInWithApple")}
          </ButtonText>
        </Button>
      )}
    </VStack>
  );
}
