import { Post } from "@/api/feeds/queries";
import {
  CommentsSheet,
  CommentsSheetRef,
} from "@/components/feeds/CommentsSheet";
import FeedList from "@/components/feeds/FeedList";
import { VStack } from "@/components/ui/vstack";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostsListScreen() {
  const { groupId, visibility, initialPostId } = useLocalSearchParams();
  const { t } = useTranslation();
  const router = useRouter();
  const commentsSheetRef = useRef<CommentsSheetRef>(null);

  const handleCommentPress = (post: Post) => {
    commentsSheetRef.current?.present(post.id);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white py-2 dark:bg-background-dark"
      edges={["top"]}
    >
      <VStack className="flex-1 pb-10">
        <Stack.Screen 
          options={{ 
            headerShown: false, 
            gestureEnabled: true, 
            fullScreenGestureEnabled: true 
          }} 
        />

        <FeedList
          groupId={groupId as string}
          visibility={visibility as "public" | "group"}
          onCommentPress={handleCommentPress}
          initialPostId={initialPostId as string}
        />
      </VStack>

      <CommentsSheet ref={commentsSheetRef} />
    </SafeAreaView>
  );
}
