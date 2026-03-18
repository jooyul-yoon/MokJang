import { Post } from "@/api/feeds/queries";
import {
  CommentsSheet,
  CommentsSheetRef,
} from "@/components/feeds/CommentsSheet";
import FeedGrid from "@/components/feeds/FeedGrid";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupFeedScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const router = useRouter();
  const commentsSheetRef = useRef<CommentsSheetRef>(null);

  const handleCommentPress = (post: Post) => {
    commentsSheetRef.current?.present(post.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light py-2 dark:bg-background-dark">
      <VStack className="flex-1">
        {/* Header */}
        <HStack className="items-center justify-between border-b border-outline-100 px-4 pb-4 dark:border-outline-800">
          <HStack className="items-center gap-4">
            <Pressable onPress={() => router.back()} className="p-1">
              <IconSymbol name="chevron.left" size={24} color="gray" />
            </Pressable>
            <Text className="text-lg font-bold">{t("community.feeds")}</Text>
          </HStack>
          <Pressable onPress={() => router.push("/new-post")} className="p-1">
            <IconSymbol name="plus.app" size={24} color="gray" />
          </Pressable>
        </HStack>

        <FeedGrid
          groupId={id as string}
          scrollEnabled={true}
        />
      </VStack>

      <CommentsSheet ref={commentsSheetRef} />
    </SafeAreaView>
  );
}
