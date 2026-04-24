import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { useFeeds } from "@/hooks/useFeeds/useFeed";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";

const { width } = Dimensions.get("window");
const THUMB_SIZE = width / 3;

interface FeedGridProps {
  userId?: string;
  groupId?: string;
  scrollEnabled?: boolean;
}

export default function FeedGrid({
  userId,
  groupId,
  scrollEnabled = false,
}: FeedGridProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // NOTE: Currently useFeeds only filters by visibility and groupId.
  // We need to modify useFeeds or use a new hook to filter by author's userId.
  // For now, let's assume we update the hook to support `authorId` or we just fetch it.
  // I will update useFeeds and queries.ts to support `authorId`.
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFeeds({
      authorId: userId,
      groupId: groupId,
      visibility: groupId ? "group" : "public",
    } as any);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    onRefreshHelper(setRefreshing, ["feeds"]);
  };

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (isLoading && !refreshing) {
    return (
      <Box className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  return (
    <FlatList
      data={posts}
      numColumns={3}
      scrollEnabled={scrollEnabled}
      contentContainerStyle={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <Box className="flex-1 items-center justify-center py-10">
          <Text className="text-typography-500">{t("community.no_feed")}</Text>
        </Box>
      }
      keyExtractor={(item) => item.id}
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      renderItem={({ item }) => (
        <Pressable
          style={{ width: THUMB_SIZE, height: THUMB_SIZE, padding: 1 }}
          onPress={() =>
            router.push({
              pathname: "/posts/list",
              params: {
                groupId: groupId || "",
                visibility: groupId ? "group" : "public",
                initialPostId: item.id,
              },
            })
          }
        >
          <Image
            source={{ uri: item.images[0] }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          {item.images.length > 1 && (
            <Box className="absolute right-2 top-2">
              <IconSymbol name="square.on.square" size={16} color="white" />
            </Box>
          )}
        </Pressable>
      )}
    />
  );
}
