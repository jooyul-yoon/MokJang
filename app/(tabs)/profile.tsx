import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{
    full_name: string;
    avatar_url: string;
  } | null>(null);
  const [mokjang, setMokjang] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) getProfile(session);
    });
  }, []);

  async function getProfile(session: Session) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, avatar_url`)
        .eq("id", session.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
      }

      // Fetch MokJang membership
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          groups (
            name,
            description
          )
        `,
        )
        .eq("user_id", session.user.id)
        .single();

      if (memberData?.groups) {
        // @ts-ignore
        setMokjang(memberData.groups);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session.user.id,
        full_name: fullName,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      setProfile((prev) => ({ ...prev!, full_name: fullName }));
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      const fileName = `${session?.user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(image.base64), {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      const updates = {
        id: session?.user.id,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(updates);

      if (updateError) {
        throw updateError;
      }

      setProfile((prev) => ({ ...prev!, avatar_url: avatarUrl }));
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
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
          <Heading className="text-2xl font-bold text-typography-black dark:text-typography-white">
            {t("tabs.profile")}
          </Heading>

          {/* Avatar Section */}
          <VStack className="items-center space-y-4">
            <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
              <Avatar size="2xl" className="bg-primary-500">
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
          <VStack className="dark:bg-background-card space-y-2 rounded-xl bg-white p-4 shadow-sm">
            <HStack className="items-center justify-between">
              <Text className="text-sm font-medium text-typography-500">
                Name
              </Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text className="text-primary-500">Edit</Text>
                </TouchableOpacity>
              )}
            </HStack>
            {isEditing ? (
              <HStack className="space-x-2">
                <TextInput
                  className="flex-1 rounded-md border border-outline-300 p-2 text-typography-black dark:border-outline-700 dark:text-typography-white"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your name"
                />
                <Button size="sm" onPress={updateProfile}>
                  <ButtonText>Save</ButtonText>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setFullName(profile?.full_name || "");
                    setIsEditing(false);
                  }}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
              </HStack>
            ) : (
              <Text className="text-lg font-semibold text-typography-black dark:text-typography-white">
                {profile?.full_name || "No name set"}
              </Text>
            )}
          </VStack>

          {/* MokJang Section */}
          <VStack className="dark:bg-background-card space-y-4 rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-sm font-medium text-typography-500">
              My MokJang
            </Text>
            {mokjang ? (
              <VStack className="space-y-2">
                <Heading className="text-xl font-bold text-typography-black dark:text-typography-white">
                  {mokjang.name}
                </Heading>
                <Text className="text-typography-500">
                  {mokjang.description}
                </Text>
              </VStack>
            ) : (
              <VStack className="items-center space-y-4 py-4">
                <Text className="text-center text-typography-500">
                  You haven't joined a MokJang yet.
                </Text>
                <Button onPress={() => router.push("/(tabs)/community")}>
                  <ButtonText>Join a MokJang</ButtonText>
                </Button>
              </VStack>
            )}
          </VStack>

          {/* Sign Out */}
          <Button
            variant="outline"
            action="negative"
            className="mt-4"
            onPress={() => supabase.auth.signOut()}
          >
            <ButtonText>Sign Out</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
