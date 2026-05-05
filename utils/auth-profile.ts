import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppleAuthentication from "expo-apple-authentication";
import type { User } from "@supabase/supabase-js";

const PENDING_APPLE_FULL_NAME_KEY = "pendingAppleFullName:last";
const PENDING_APPLE_FULL_NAME_USER_PREFIX = "pendingAppleFullName:user:";

const normalizeName = (name?: unknown) => {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const formatAppleFullName = (
  fullName: AppleAuthentication.AppleAuthenticationFullName | null,
) => {
  if (!fullName) return null;

  try {
    return normalizeName(AppleAuthentication.formatFullName(fullName));
  } catch {
    return normalizeName(
      [
        fullName.namePrefix,
        fullName.givenName,
        fullName.middleName,
        fullName.familyName,
        fullName.nameSuffix,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
};

export const isAppleAuthUser = (user: User) =>
  user.app_metadata?.provider === "apple" ||
  user.identities?.some((identity) => identity.provider === "apple") ||
  false;

export const getAuthMetadataName = (user: User) => {
  const metadata = user.user_metadata ?? {};

  return (
    normalizeName(metadata.full_name) ||
    normalizeName(metadata.name) ||
    normalizeName(metadata.display_name)
  );
};

export const savePendingAppleFullName = async (
  fullName: string,
  userId?: string,
) => {
  const normalizedName = normalizeName(fullName);
  if (!normalizedName) return;

  await AsyncStorage.setItem(PENDING_APPLE_FULL_NAME_KEY, normalizedName);
  if (userId) {
    await AsyncStorage.setItem(
      `${PENDING_APPLE_FULL_NAME_USER_PREFIX}${userId}`,
      normalizedName,
    );
  }
};

export const getPendingAppleFullName = async (userId: string) => {
  const userScopedName = await AsyncStorage.getItem(
    `${PENDING_APPLE_FULL_NAME_USER_PREFIX}${userId}`,
  );

  return (
    normalizeName(userScopedName) ||
    normalizeName(await AsyncStorage.getItem(PENDING_APPLE_FULL_NAME_KEY))
  );
};

export const clearPendingAppleFullName = async (userId: string) => {
  await AsyncStorage.multiRemove([
    `${PENDING_APPLE_FULL_NAME_USER_PREFIX}${userId}`,
    PENDING_APPLE_FULL_NAME_KEY,
  ]);
};
