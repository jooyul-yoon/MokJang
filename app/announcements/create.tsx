import { GoBackHeader } from "@/components/GoBackHeader";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createAnnouncement } from "@/services/AnnouncementApi";
import { AnnouncementType } from "@/types/typeAnnouncement";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { XIcon } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateAnnouncementScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnouncementType>("news");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(t("common.error"), t("announcements.create.error_fill_all"));
      return;
    }

    setIsSubmitting(true);
    try {
      const { success, error } = await createAnnouncement(title, content, type);
      if (success) {
        await queryClient.invalidateQueries({ queryKey: ["announcements"] });
        Alert.alert(t("common.success"), t("announcements.create.success"), [
          { text: t("announcements.create.ok"), onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          t("common.error"),
          error || t("announcements.create.error_create"),
        );
      }
    } catch (e) {
      Alert.alert(t("common.error"), t("announcements.create.error_create"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const types: { value: AnnouncementType; label: string; color: string }[] = [
    { value: "news", label: "News", color: "bg-amber-500" },
    { value: "meeting", label: "Meeting", color: "bg-blue-500" },
    { value: "retreat", label: "Retreat", color: "bg-green-500" },
    { value: "picnic", label: "Picnic", color: "bg-orange-500" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <GoBackHeader
        title={t("announcements.create.title")}
        GoBackIcon={XIcon}
        rightElement={
          <TouchableOpacity
            onPress={handleCreate}
            disabled={isSubmitting}
            className="px-2"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#467CFA" />
            ) : (
              <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                OK
              </Text>
            )}
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 px-5 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flex: 1 }}
          >
            <VStack space="lg" className="flex-1 pb-10">
              {/* Type Selection */}
              <VStack space="xs">
                <Text className="text-sm font-bold text-typography-900 dark:text-typography-100">
                  {t("announcements.create.category")}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {types.map((t) => {
                    const isSelected = type === t.value;
                    return (
                      <Pressable
                        key={t.value}
                        onPress={() => setType(t.value)}
                        className={`flex-row items-center rounded-full border px-4 py-2 ${
                          isSelected
                            ? "border-primary-500 bg-primary-50"
                            : "border-outline-200 bg-white dark:bg-gray-950"
                        }`}
                      >
                        {isSelected && (
                          <Box
                            className={`mr-2 h-2 w-2 rounded-full ${t.color}`}
                          />
                        )}
                        <Text
                          className={`text-sm font-medium ${
                            isSelected
                              ? "text-primary-600"
                              : "text-typography-600"
                          }`}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </VStack>

              {/* Title Input */}
              <VStack space="xs">
                <Text className="text-sm font-bold text-typography-900 dark:text-typography-100">
                  {t("announcements.create.input_title")}
                </Text>
                <Input
                  variant="underlined"
                  size="md"
                  className="border-b border-outline-300 dark:border-outline-700"
                >
                  <InputField
                    placeholder={t(
                      "announcements.create.input_title_placeholder",
                    )}
                    value={title}
                    onChangeText={setTitle}
                    className="text-base text-typography-900 dark:text-typography-100"
                  />
                </Input>
              </VStack>

              {/* Content Input */}
              <VStack space="xs" className="flex-1">
                <Text className="text-sm font-bold text-typography-900 dark:text-typography-100">
                  {t("announcements.create.input_content")}
                </Text>
                <Input
                  variant="underlined"
                  size="md"
                  className="h-64 items-start border-b border-outline-300 p-0 dark:border-outline-700"
                >
                  <InputField
                    placeholder={t(
                      "announcements.create.input_content_placeholder",
                    )}
                    multiline
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                    className="h-full text-base leading-6 text-typography-900 dark:text-typography-100"
                  />
                </Input>
              </VStack>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
