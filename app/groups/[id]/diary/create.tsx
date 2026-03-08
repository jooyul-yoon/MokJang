import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createGroupDiary } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Type, X } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateDiaryScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createMutation = useMutation({
    mutationFn: () => createGroupDiary(groupId as string, title, content),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["groupDiaries", groupId] });
        router.back();
      } else {
        Alert.alert(t("common.error"), res.error);
      }
    },
    onError: (error: any) => {
      Alert.alert(t("common.error"), error.message);
    },
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate();
  };

  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-background-dark"
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Bar */}
        <HStack className="items-center justify-between px-5 pb-2 pt-4">
          {/* Left Icon (Tt equivalent) */}
          <Center className="h-10 w-10 rounded-full bg-outline-100 dark:bg-primary-100">
            <Icon as={Type} size="md" className="text-typography-900" />
          </Center>

          {/* Title */}
          <Text className="text-lg font-bold text-typography-900">
            {t("community.diary")}
          </Text>

          {/* Right Close Button */}
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Center className="h-10 w-10 rounded-full bg-outline-100 dark:bg-primary-100">
              <Icon as={X} size="md" className="text-typography-900" />
            </Center>
          </TouchableOpacity>
        </HStack>

        <ScrollView className="flex-1 px-5 pt-6">
          <VStack className="gap-4">
            {/* Title Input */}
            <TextInput
              className="text-3xl font-bold text-typography-900"
              placeholder={t("community.diary_title_placeholder")}
              placeholderTextColor="#A3A3A3"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {/* Date Display */}
            <Text className="text-md font-medium text-typography-400">
              {currentDate}
            </Text>

            {/* Content Input */}
            <TextInput
              className="mt-4 text-left text-lg leading-7 text-typography-800"
              placeholder={t("community.diary_content_placeholder")}
              placeholderTextColor="#D4D4D4"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 300 }}
            />
          </VStack>
        </ScrollView>

        {/* Bottom Save Button */}
        <VStack className="border-t border-outline-50 px-5 pb-5 pt-2">
          <Button
            size="xl"
            variant="solid"
            action="primary"
            className="w-full rounded-2xl bg-black dark:bg-white"
            onPress={handleSave}
            isDisabled={
              createMutation.isPending || !title.trim() || !content.trim()
            }
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText className="font-bold">
                {t("community.save_diary")}
              </ButtonText>
            )}
          </Button>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
