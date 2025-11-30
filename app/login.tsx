import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import React from "react";

WebBrowser.maybeCompleteAuthSession(); // Required for web only

const redirectTo = makeRedirectUri();

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
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (res.type === "success") {
    const { url } = res;
    await createSessionFromUrl(url);
  }
};

export default function LoginScreen() {
  return (
    <VStack className="flex-1 items-center justify-center bg-background-light p-4 dark:bg-background-dark">
      <Text className="mb-8 text-3xl font-bold text-typography-black dark:text-typography-white">
        MokJang
      </Text>
      <Button
        onPress={performOAuth}
        className="w-full max-w-xs"
        action="primary"
      >
        <ButtonText>Sign in with Google</ButtonText>
      </Button>
    </VStack>
  );
}
