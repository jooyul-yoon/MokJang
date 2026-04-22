import { Post } from "@/api/feeds/queries";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFeeds } from "@/hooks/useFeeds/useFeed";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList } from "react-native";
import FeedItem from "./FeedItem";

interface FeedListProps {
  visibility?: "public" | "group";
  groupId?: string;
  onCommentPress: (post: Post) => void;
  ListHeaderComponent?: React.ReactElement | null;
  initialPostId?: string;
}

export default function FeedList({
  visibility,
  groupId,
  onCommentPress,
  ListHeaderComponent,
  initialPostId,
}: FeedListProps) {
  const { t } = useTranslation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useFeeds({ visibility, groupId });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  const flatListRef = useRef<FlatList>(null);
  const [hasScrolledToInitial, setHasScrolledToInitial] = useState(false);

  useEffect(() => {
    if (initialPostId && posts.length > 0 && !hasScrolledToInitial) {
      const index = posts.findIndex((p) => p.id === initialPostId);
      if (index >= 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 100);
        setHasScrolledToInitial(true);
      }
    }
  }, [posts, initialPostId, hasScrolledToInitial]);

  if (isLoading && !isRefetching) {
    return (
      <Box className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="flex-1 items-center justify-center p-4">
        <Text>{t("common.unexpected_error")}</Text>
        <Text className="mt-2 text-primary-500" onPress={() => refetch()}>
          Tap to retry
        </Text>
      </Box>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={posts}
      onScrollToIndexFailed={(info) => {
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: false,
          });
        });
      }}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FeedItem post={item} onCommentPress={onCommentPress} />
      )}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <VStack className="flex-1 items-center justify-center px-4 py-20">
          <Text className="text-center text-typography-500">
            {t("community.no_feed")}
          </Text>
        </VStack>
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Box className="items-center p-4">
            <ActivityIndicator />
          </Box>
        ) : null
      }
    />
  );
}
