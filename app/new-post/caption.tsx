import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCreatePost } from "@/hooks/useFeeds/useCreatePost";
import { useGroupStore } from "@/store/groupStore";
import { useNewPostStore } from "@/store/useNewPostStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewPostCaptionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    selectedAssets,
    caption,
    visibility,
    setCaption,
    setVisibility,
    reset,
  } = useNewPostStore();
  const { selectedGroup } = useGroupStore();
  const { mutateAsync: createPost, isPending } = useCreatePost();

  const handlePublish = async () => {
    if (selectedAssets.length === 0) return;
    try {
      await createPost({
        assetIds: selectedAssets.map((a) => a.id),
        content: caption,
        visibility: visibility,
        groupId: selectedGroup?.id || null,
      });
      reset();
      router.dismissAll(); // Return to previous stack (assumed home or feeds)
    } catch (e) {
      console.error(e);
      // Let error handling happen, maybe alert here
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 ">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <VStack className="flex-1 bg-background-light dark:bg-background-dark">
          {/* Header */}
          <HStack className="items-center justify-between border-b border-outline-100 px-4 py-3 dark:border-outline-800">
            <Pressable onPress={handleCancel}>
              <IconSymbol name="chevron.left" size={24} color="gray" />
            </Pressable>
            <Text className="text-lg font-bold">{t("feed.post.new")}</Text>
            <Button
              size="sm"
              variant="link"
              onPress={handlePublish}
              isDisabled={isPending || selectedAssets.length === 0}
            >
              {isPending && <ButtonSpinner className="mr-2" />}
              <ButtonText className="font-bold text-primary-500">
                {t("feed.post.publish")}
              </ButtonText>
            </Button>
          </HStack>

          <ScrollView
            className="flex-1 px-4 py-4"
            keyboardShouldPersistTaps="handled"
          >
            <HStack className="mb-6 items-start gap-3">
              {/* Thumbnail Preview */}
              <Box className="h-20 w-20 overflow-hidden rounded bg-outline-100">
                {selectedAssets[0] && (
                  <Image
                    source={{ uri: selectedAssets[0].uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                )}
                {selectedAssets.length > 1 && (
                  <Box className="absolute right-1 top-1 rounded bg-black/50 px-1">
                    <Text className="text-xs text-white">
                      +{selectedAssets.length - 1}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Caption Input */}
              <TextInput
                className="text-typography00 h-32 flex-1 text-base"
                placeholder={t("feed.post.captionPlaceholder")}
                placeholderTextColor="gray"
                multiline
                textAlignVertical="top"
                value={caption}
                onChangeText={setCaption}
                editable={!isPending}
              />
            </HStack>

            {/* Visibility Options */}
            <VStack className="border-t border-outline-100 pt-4 dark:border-outline-800">
              <Text className="mb-3 text-sm font-semibold text-typography-500">
                {t("feed.post.visibility")}
              </Text>

              <Pressable
                onPress={() => setVisibility("public")}
                className="mb-4"
                disabled={isPending}
              >
                <HStack className="items-center justify-between">
                  <HStack className="items-center gap-3">
                    <Box
                      className={`h-8 w-8 items-center justify-center rounded-full ${visibility === "public" ? "bg-primary-500" : "bg-outline-100 dark:bg-outline-700"}`}
                    >
                      <IconSymbol
                        name="globe"
                        size={18}
                        color={visibility === "public" ? "white" : "gray"}
                      />
                    </Box>
                    <Text
                      className={`text-base ${visibility === "public" ? "font-semibold text-primary-500" : "text-typography-800 dark:text-typography-200"}`}
                    >
                      {t("feed.post.visibilityPublic")}
                    </Text>
                  </HStack>
                  {visibility === "public" && (
                    <IconSymbol name="checkmark" size={20} color="#3B82F6" />
                  )}
                </HStack>
              </Pressable>

              {selectedGroup && (
                <Pressable
                  onPress={() => setVisibility("group")}
                  disabled={isPending}
                >
                  <HStack className="items-center justify-between">
                    <HStack className="items-center gap-3">
                      <Box
                        className={`h-8 w-8 items-center justify-center rounded-full ${visibility === "group" ? "bg-primary-500" : "bg-outline-100 dark:bg-outline-700"}`}
                      >
                        <IconSymbol
                          name="person.2.fill"
                          size={18}
                          color={visibility === "group" ? "white" : "gray"}
                        />
                      </Box>
                      <VStack>
                        <Text
                          className={`text-base ${visibility === "group" ? "font-semibold text-primary-500" : "text-typography-800 dark:text-typography-200"}`}
                        >
                          {t("feed.post.visibilityGroup")}
                        </Text>
                        <Text className="text-xs text-typography-500">
                          {selectedGroup.name}
                        </Text>
                      </VStack>
                    </HStack>
                    {visibility === "group" && (
                      <IconSymbol name="checkmark" size={20} color="#3B82F6" />
                    )}
                  </HStack>
                </Pressable>
              )}
            </VStack>
          </ScrollView>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
