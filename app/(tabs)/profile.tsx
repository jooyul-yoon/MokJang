import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import {
  deleteAccount,
  fetchMyPrayerRequests,
  fetchUserGroup,
  fetchUserProfile,
} from "@/services/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Components ---

const SectionHeader = ({ title }: { title: string }) => (
  <HStack className="mb-2 mt-6 items-center gap-4 px-1">
    <Text className="text-sm font-medium text-typography-400">{title}</Text>
    <Divider className="flex-1 bg-outline-100 dark:bg-outline-800" />
  </HStack>
);

const MenuItem = ({
  icon,
  label,
  rightElement,
  onPress,
  isDestructive = false,
  iconFamily = "Ionicons",
  iconColor,
}: {
  icon: string;
  label: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isDestructive?: boolean;
  iconFamily?: "Ionicons" | "MaterialCommunityIcons";
  iconColor?: string;
}) => {
  const { colorScheme } = useColorScheme();
  const baseIconColor = iconColor
    ? iconColor
    : isDestructive
      ? "#EF4444"
      : colorScheme === "dark"
        ? "#F3F4F6"
        : "#1F2937";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-2 py-3.5"
      activeOpacity={0.7}
    >
      <HStack className="items-center gap-4">
        {iconFamily === "MaterialCommunityIcons" ? (
          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color={baseIconColor}
          />
        ) : (
          <Ionicons name={icon as any} size={22} color={baseIconColor} />
        )}
        <Text
          className={`text-lg font-medium ${
            isDestructive ? "text-error-500" : "text-typography-700"
          }`}
        >
          {label}
        </Text>
      </HStack>
      {rightElement || (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const p = await fetchUserProfile();
      if (p) setFullName(p.full_name || "");
      return p;
    },
  });

  const { data: userGroup } = useQuery({
    queryKey: ["userGroup"],
    queryFn: fetchUserGroup,
  });

  const { data: myPrayers = [] } = useQuery({
    queryKey: ["myPrayers"],
    queryFn: fetchMyPrayerRequests,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (newName: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user on the session!");

      const updates = {
        id: user.id,
        full_name: newName,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      Alert.alert(error.message);
    },
  });

  const handleSignOut = async () => {
    Alert.alert(t("profile.signOut"), t("common.confirmSignOut"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.signOut"),
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t("common.deleteAccount"),
      t("common.deleteAccountConfirmation"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            const { success, error } = await deleteAccount();
            if (success) {
              Alert.alert(t("common.success"), t("common.accountDeleted"));
              router.replace("/login");
            } else {
              Alert.alert(
                t("common.error"),
                error || "Failed to delete account",
              );
            }
          },
        },
      ],
    );
  };

  async function uploadAvatar() {
    try {
      setUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user on the session!");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "livePhotos"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const image = result.assets[0];
      if (!image.base64) return;

      const fileExt = image.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(image.base64), {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      const updates = {
        id: user.id,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(updates);

      if (updateError) throw updateError;

      queryClient.setQueryData(["userProfile"], (old: any) => ({
        ...old,
        avatar_url: avatarUrl,
      }));
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setUploading(false);
    }
  }

  if (isProfileLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <VStack className="pb-10">
          {/* Header & Avatar */}
          <HStack className="mb-8 items-center justify-between">
            <Heading className="text-3xl font-bold text-typography-black dark:text-typography-white">
              {t("tabs.profile")}
            </Heading>
          </HStack>

          <VStack className="mb-8 items-center gap-4">
            <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
              <Avatar
                size="2xl"
                className="h-28 w-28 border-2 border-background-200"
              >
                {profile?.avatar_url ? (
                  <AvatarImage
                    source={{ uri: profile.avatar_url }}
                    alt="Profile Image"
                  />
                ) : (
                  <AvatarFallbackText className="text-3xl text-primary-600 dark:text-primary-400">
                    {profile?.full_name || "User"}
                  </AvatarFallbackText>
                )}
                <View className="dark:bg-background-card-dark absolute bottom-0 right-0 rounded-full border border-outline-100 bg-white p-2 shadow-sm dark:border-outline-800">
                  <Ionicons
                    name="camera"
                    size={16}
                    color={colorScheme === "dark" ? "#000" : "#666"}
                  />
                </View>
              </Avatar>
            </TouchableOpacity>

            {/* Name Edit */}
            {isEditing ? (
              <HStack className="items-center gap-2">
                <TextInput
                  className="rounded-lg border border-outline-300 bg-white px-3 py-1.5 text-base text-typography-900 dark:border-outline-700 dark:bg-background-800 dark:text-typography-100"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t("profile.namePlaceholder")}
                  autoFocus
                />
                <Button
                  size="xs"
                  onPress={() => updateProfileMutation.mutate(fullName)}
                  isDisabled={updateProfileMutation.isPending}
                  className="rounded-full"
                >
                  <ButtonText>{t("profile.save")}</ButtonText>
                </Button>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </HStack>
            ) : (
              <VStack className="items-center">
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="flex-row items-center gap-2"
                >
                  <Text className="text-xl font-bold text-typography-900">
                    {profile?.full_name || "No name set"}
                  </Text>
                  <Ionicons name="pencil" size={14} color="#9CA3AF" />
                </TouchableOpacity>
                <Text className="text-sm text-typography-500">
                  {userGroup?.name || t("profile.noMokjang")}
                </Text>
              </VStack>
            )}

            {/* Quick Stats or Actions could go here, for now keeping it clean */}
          </VStack>

          {/* General Section */}
          <SectionHeader title="General" />

          {/* My Prayer Requests */}
          <MenuItem
            icon="hands-pray"
            iconFamily="MaterialCommunityIcons"
            label={t("profile.myPrayers")}
            onPress={() => router.push("/prayer-requests/mine")}
            rightElement={
              <HStack className="items-center gap-2">
                <Text className="text-sm text-typography-500">
                  {myPrayers.length > 0 ? `${myPrayers.length}` : ""}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"}
                />
              </HStack>
            }
          />

          <MenuItem
            icon="people-outline"
            label={t("community.myMokjang")}
            onPress={() => {
              if (userGroup) {
                // Navigate to group details or just community tab
                router.push("/(tabs)/community");
              } else {
                router.push("/(tabs)/community"); // To join
              }
            }}
            rightElement={
              <HStack className="items-center gap-2">
                <Text className="text-sm text-typography-500">
                  {userGroup ? userGroup.name : t("profile.joinMokjang")}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"}
                />
              </HStack>
            }
          />

          {/* General Section */}
          <SectionHeader title="General" />

          <MenuItem
            icon="earth-outline"
            label={t("common.language")}
            rightElement={
              <HStack className="items-center gap-2">
                <Text className="text-sm text-typography-500">
                  {i18n.language === "ko" ? "한국어" : "English (US)"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"}
                />
              </HStack>
            }
            onPress={() => {
              // Simple toggle for now or navigate to settings
              const nextLang = i18n.language === "ko" ? "en" : "ko";
              i18n.changeLanguage(nextLang);
            }}
          />

          <MenuItem
            icon={colorScheme === "dark" ? "moon-outline" : "sunny-outline"}
            label={t("common.dark")} // Using "Theme" or "Dark Mode" key
            rightElement={
              <Switch
                size="md"
                value={colorScheme === "dark"}
                onValueChange={toggleColorScheme}
                trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                thumbColor={
                  Platform.OS === "ios"
                    ? "#FFF"
                    : colorScheme === "dark"
                      ? "#FFF"
                      : "#F3F4F6"
                }
              />
            }
          />

          <MenuItem
            icon="notifications-outline"
            label={t("profile.notifications", {
              defaultValue: "Notifications",
            })}
            rightElement={
              <Switch
                size="md"
                value={profile?.is_notification_enabled ?? false}
                onValueChange={async (val) => {
                  /* Optimistic update could go here, but for now just mutate */
                  const oldData = queryClient.getQueryData(["userProfile"]);
                  queryClient.setQueryData(["userProfile"], (old: any) => ({
                    ...old,
                    is_notification_enabled: val,
                  }));

                  const { success, error } =
                    await updateNotificationSettings(val);

                  if (!success) {
                    // Revert on error
                    queryClient.setQueryData(["userProfile"], oldData);
                    Alert.alert(t("common.error"), error);
                  } else {
                    queryClient.invalidateQueries({
                      queryKey: ["userProfile"],
                    });
                  }
                }}
                trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                thumbColor={
                  Platform.OS === "ios"
                    ? "#FFF"
                    : colorScheme === "dark"
                      ? "#FFF"
                      : "#F3F4F6"
                }
              />
            }
          />

          {/* Account Section */}
          <SectionHeader title="Account" />

          <MenuItem
            icon="log-out-outline"
            label={t("profile.signOut")}
            isDestructive
            onPress={handleSignOut}
            rightElement={<View />} // Empty view to hide chevron
          />

          <MenuItem
            icon="trash-outline"
            label={t("common.deleteAccount")}
            isDestructive
            onPress={handleDeleteAccount}
            rightElement={<View />} // Empty view to hide chevron
          />

          <Text className="mt-6 text-center text-xs text-typography-300">
            Version 1.0.0
          </Text>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
