import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { fetchMyGroups } from "@/services/GroupsApi";
import { createPrayerRequest } from "@/services/PrayerRequestApi";
import { prayerRequestCategories } from "@/types/typePrayerRequest";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Activity,
  BookOpen,
  Briefcase,
  FolderOpen,
  Forward,
  Home,
  Lock,
  MessageCircle,
  MessageCircleQuestion,
  MoreHorizontal,
  Search,
  Users,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case "general":
      return MessageCircle;
    case "health":
      return Activity;
    case "studies":
      return BookOpen;
    case "family":
      return Home;
    case "work":
      return Briefcase;
    case "job":
      return Search;
    case "other":
    default:
      return MoreHorizontal;
  }
};

export default function CreatePrayerRequest() {
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ko" ? "ko-KR" : "en-US";
  const queryClient = useQueryClient();
  const toast = useToast();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "group" | "private">(
    "group",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: myGroups = [] } = useQuery({
    queryKey: ["myGroups"],
    queryFn: fetchMyGroups,
  });

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert(
        t("common.error"),
        t("announcements.create.error_fill_all") || "Please enter content",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Use myGroups[0] if it exists
      const groupId = visibility === "group" ? myGroups[0]?.id || null : null;

      const { success, error } = await createPrayerRequest(
        content,
        visibility,
        groupId,
        category,
      );
      if (success) {
        toast.show({
          placement: "bottom",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} variant="solid">
              <VStack space="xs">
                <ToastDescription>
                  {t("community.success_create_prayer_request")}
                </ToastDescription>
              </VStack>
            </Toast>
          ),
        });
        await queryClient.invalidateQueries({ queryKey: ["prayerRequests"] });
        router.back();
      } else {
        Alert.alert(
          t("common.error"),
          error || t("community.error_create_prayer_request"),
        );
      }
    } catch (e) {
      Alert.alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibilityOptions = [
    { value: "public" as const, label: t("common.public", "Public") },
    { value: "group" as const, label: t("common.group", "Group") },
    { value: "private" as const, label: t("common.private", "Private") },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white px-4 dark:bg-background-dark">
      {/* Header */}
      <HStack className="mb-4 mt-4 items-center justify-between">
        <Center className="rounded-[16px] bg-primary-50 p-3">
          <Icon
            as={MessageCircleQuestion}
            className="h-7 w-7 text-typography-800"
          />
        </Center>
        <Center>
          <Text className="text-xl font-medium text-typography-900 dark:text-typography-50">
            {t("community.post_prayer_request")}
          </Text>
        </Center>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.5}>
          <Center className="rounded-[16px] bg-primary-50 p-3">
            <Icon as={X} className="h-7 w-7 text-typography-800" />
          </Center>
        </TouchableOpacity>
      </HStack>

      <Divider />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <VStack className="mt-4 flex-1" space="xl">
              <FormControl isInvalid={content.length > 500} className="w-full">
                <HStack className="mb-4 items-center justify-between">
                  <Text className="text-base text-typography-600 dark:text-typography-400">
                    {new Date().toLocaleDateString(language, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <FormControlHelper className="justify-end">
                    <FormControlHelperText
                      className={content.length > 500 ? "text-error-500" : ""}
                    >
                      {content.length}/500
                    </FormControlHelperText>
                  </FormControlHelper>
                </HStack>
                <Input className="min-h-48 border-0">
                  <InputField
                    multiline
                    placeholder={t("community.enter_prayer_request")}
                    value={content}
                    onChangeText={setContent}
                    className="h-full text-xl leading-6 text-typography-900 dark:text-typography-100"
                  />
                </Input>
              </FormControl>
            </VStack>

            <VStack space="md">
              {/* Visibility Toggle */}
              <HStack className="items-center justify-between px-1">
                <Heading
                  size="sm"
                  className="text-typography-900 dark:text-typography-50"
                >
                  {t("common.visibility")}
                </Heading>
                <TouchableOpacity
                  onPress={() =>
                    setVisibility((prev) =>
                      prev === "group" ? "private" : "group",
                    )
                  }
                  activeOpacity={0.7}
                  className="rounded-full bg-primary-50 p-2 dark:bg-primary-900/30"
                >
                  <Icon
                    as={visibility === "group" ? Users : Lock}
                    className="h-6 w-6 text-primary-600 dark:text-primary-400"
                  />
                </TouchableOpacity>
              </HStack>
              {/* Category Selection */}
              <HStack className="items-center justify-between px-1">
                <Heading
                  size="sm"
                  className="text-typography-900 dark:text-typography-50"
                >
                  {t("common.category")}
                </Heading>
                <HStack space="sm" className="items-center">
                  <TouchableOpacity
                    onPress={() => setShowCategorySheet(true)}
                    activeOpacity={0.7}
                    className="rounded-full bg-primary-50 p-2 dark:bg-primary-900/30"
                    style={{
                      backgroundColor: category
                        ? `${prayerRequestCategories[category].color}1A`
                        : "",
                    }}
                  >
                    <VStack space="xs" className="items-center justify-center">
                      {category ? (
                        <>
                          <Icon
                            as={getCategoryIcon(category)}
                            className="h-4 w-4"
                            style={{
                              color: prayerRequestCategories[category].color,
                            }}
                          />
                          <Text
                            className="font-semibold"
                            style={{
                              color: prayerRequestCategories[category].color,
                            }}
                          >
                            {i18n.language === "ko"
                              ? prayerRequestCategories[category].ko
                              : prayerRequestCategories[category].en
                                  .charAt(0)
                                  .toUpperCase() +
                                prayerRequestCategories[category].en.slice(1)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Icon
                            as={FolderOpen}
                            className="h-6 w-6 text-primary-600 dark:text-primary-400"
                          />
                          <Text>선택</Text>
                        </>
                      )}
                    </VStack>
                  </TouchableOpacity>
                </HStack>
              </HStack>
            </VStack>
            {/* Submit Button */}
            <Button
              className="mt-8 h-12 w-full rounded-full bg-primary-500"
              onPress={handleSubmit}
              isDisabled={
                isSubmitting || content.length === 0 || content.length > 500
              }
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <ButtonText className="text-lg font-bold text-white">
                    {t("community.post_prayer_request")}
                  </ButtonText>
                  <ButtonIcon as={Forward} />
                </>
              )}
            </Button>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Actionsheet
        isOpen={showCategorySheet}
        onClose={() => setShowCategorySheet(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className="w-full pb-8 pt-4" space="sm">
            {Object.values(prayerRequestCategories).map((cat) => (
              <ActionsheetItem
                key={cat.id}
                onPress={() => {
                  setCategory(cat.id === category ? null : cat.id);
                  setShowCategorySheet(false);
                }}
              >
                <HStack space="md" className="items-center">
                  <Center
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: `${cat.color}1A` }}
                  >
                    <Icon
                      as={getCategoryIcon(cat.id)}
                      className="h-4 w-4"
                      style={{ color: cat.color }}
                    />
                  </Center>
                  <ActionsheetItemText className="font-semibold text-typography-800 dark:text-typography-200">
                    {i18n.language === "ko"
                      ? cat.ko
                      : cat.en.charAt(0).toUpperCase() + cat.en.slice(1)}
                  </ActionsheetItemText>
                </HStack>
              </ActionsheetItem>
            ))}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}
