import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import {
  fetchMyPrayerRequests,
  fetchUserGroup,
  fetchUserProfile,
} from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
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

  const { data: userGroup, isLoading: isGroupLoading } = useQuery({
    queryKey: ["userGroup"],
    queryFn: fetchUserGroup,
  });

  const { data: myPrayers = [], isLoading: isPrayersLoading } = useQuery({
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

  if (isProfileLoading || isGroupLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        <VStack className="space-y-6 pb-10">
          <HStack className="mb-4 items-center justify-between">
            <Heading className="text-2xl font-bold text-typography-black dark:text-typography-white">
              {t("tabs.profile")}
            </Heading>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={colorScheme === "dark" ? "#FFF" : "#000"}
              />
            </TouchableOpacity>
          </HStack>

          {/* Avatar Section */}
          <VStack className="items-center gap-4">
            <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
              <Avatar
                size="2xl"
                className="border-4 border-outline-100 bg-primary-500"
              >
                {profile?.avatar_url ? (
                  <AvatarImage
                    source={{ uri: profile.avatar_url }}
                    alt="Profile Image"
                  />
                ) : (
                  <AvatarFallbackText>
                    {profile?.full_name || "User"}
                  </AvatarFallbackText>
                )}
                <View className="absolute bottom-0 right-0 rounded-full bg-background-light p-2 shadow-sm dark:bg-background-dark">
                  <Ionicons name="camera" size={20} color="#666" />
                </View>
              </Avatar>
            </TouchableOpacity>
            {uploading && <ActivityIndicator size="small" />}
          </VStack>

          {/* Name Section */}
          <VStack className="space-y-2 rounded-xl p-4">
            <HStack className="items-center justify-between">
              <Text className="text-sm font-medium text-typography-500">
                {t("profile.name")}
              </Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text className="text-primary-500">{t("profile.edit")}</Text>
                </TouchableOpacity>
              )}
            </HStack>
            {isEditing ? (
              <HStack className="space-x-2">
                <TextInput
                  className="flex-1 rounded-md border border-outline-300 p-2 text-typography-black dark:border-outline-700 dark:text-typography-white"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t("profile.namePlaceholder")}
                />
                <Button
                  size="sm"
                  onPress={() => updateProfileMutation.mutate(fullName)}
                  isDisabled={updateProfileMutation.isPending}
                >
                  <ButtonText>{t("profile.save")}</ButtonText>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setFullName(profile?.full_name || "");
                    setIsEditing(false);
                  }}
                >
                  <ButtonText>{t("profile.cancel")}</ButtonText>
                </Button>
              </HStack>
            ) : (
              <Text className="text-lg font-semibold text-typography-black dark:text-typography-white">
                {profile?.full_name || "No name set"}
              </Text>
            )}
          </VStack>

          {/* MokJang Section */}
          <VStack className="space-y-4 rounded-xl p-4">
            <Text className="text-sm font-medium text-typography-500">
              {t("profile.mokjang")}
            </Text>
            {userGroup ? (
              <VStack className="space-y-2">
                <Heading className="text-xl font-bold text-typography-black dark:text-typography-white">
                  {userGroup.name}
                </Heading>
                <Text className="text-typography-500">
                  {userGroup.description}
                </Text>
              </VStack>
            ) : (
              <VStack className="items-center space-y-4 py-4">
                <Text className="text-center text-typography-500">
                  {t("profile.noMokjang")}
                </Text>
                <Button onPress={() => router.push("/(tabs)/community")}>
                  <ButtonText>{t("profile.joinMokjang")}</ButtonText>
                </Button>
              </VStack>
            )}
          </VStack>

          {/* My Prayer Requests Section */}
          <VStack className="space-y-4 rounded-xl p-4">
            <Text className="text-sm font-medium text-typography-500">
              {t("profile.myPrayers")}
            </Text>
            {isPrayersLoading ? (
              <ActivityIndicator />
            ) : myPrayers.length > 0 ? (
              <VStack className="gap-3">
                {myPrayers.map((prayer) => (
                  <TouchableOpacity
                    key={prayer.id}
                    onPress={() => router.push(`/prayer-requests/${prayer.id}`)}
                  >
                    <Card className="dark:bg-background-card-dark rounded-lg bg-white p-4">
                      <HStack className="mb-2 items-center justify-between">
                        <Text className="text-xs text-typography-500">
                          {new Date(prayer.created_at).toLocaleDateString()}
                        </Text>
                        <Text className="text-xs uppercase text-typography-400">
                          {prayer.visibility === "public"
                            ? t("common.public", "Public")
                            : prayer.visibility === "private"
                              ? t("common.private", "Private")
                              : t("common.group", "Group")}
                        </Text>
                      </HStack>
                      <Text
                        numberOfLines={2}
                        className="leading-normal text-typography-700"
                      >
                        {prayer.content}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </VStack>
            ) : (
              <Text className="py-4 text-center text-typography-500">
                {t("community.noPrayerRequests", "No prayer requests yet.")}
              </Text>
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
