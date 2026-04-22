import { Post } from "@/api/feeds/queries";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useToggleLike } from "@/hooks/useFeeds/useFeed";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, ScrollView } from "react-native";

const { width } = Dimensions.get("window");

interface FeedItemProps {
  post: Post;
  onCommentPress: (post: Post) => void;
}

export default function FeedItem({ post, onCommentPress }: FeedItemProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { mutate: toggleLike } = useToggleLike();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleLike = () => {
    toggleLike({ postId: post.id, hasLiked: post.has_liked });
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentImageIndex(Math.round(index));
  };

  return (
    <VStack className="mb-6 border-b border-gray-300 py-2 dark:border-gray-700">
      {/* Header */}
      <HStack className="items-center justify-between px-3 py-4">
        <HStack className="items-center gap-2">
          <Avatar size="sm">
            {post.profiles?.avatar_url ? (
              <AvatarImage
                source={{ uri: post.profiles.avatar_url }}
                alt="avatar"
              />
            ) : (
              <AvatarFallbackText>
                {post.profiles?.full_name}
              </AvatarFallbackText>
            )}
          </Avatar>
          <VStack>
            <HStack className="items-center gap-2">
              <Text className="text-[14px] font-bold text-typography-900">
                {post.profiles?.full_name}
              </Text>
              <Text className="text-xs text-typography-500">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </Text>
            </HStack>
          </VStack>
        </HStack>
        <Pressable className="p-1">
          <IconSymbol
            name="ellipsis"
            size={20}
            color={isDark ? "white" : "black"}
          />
        </Pressable>
      </HStack>

      {/* Media */}
      <Box
        style={{ width, height: width }}
        className="bg-background-200 dark:bg-background-800"
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
        >
          {post.images.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={{ width, height: width }}
              contentFit="cover"
            />
          ))}
        </ScrollView>
        {/* Pagination Dots */}
        {post.images.length > 1 && (
          <HStack className="absolute bottom-[-15px] left-0 right-0 z-10 flex-row justify-center gap-1.5">
            {post.images.map((_, idx) => (
              <Box
                key={idx}
                className={`h-1.5 rounded-full ${idx === currentImageIndex ? "w-1.5 bg-primary-500" : "w-1.5 bg-outline-300 dark:bg-outline-600"}`}
              />
            ))}
          </HStack>
        )}
      </Box>

      {/* Actions */}
      <HStack className="mt-2 items-center justify-start px-3 py-2">
        <HStack className="items-center gap-1">
          <Pressable onPress={handleLike} className="p-1">
            <IconSymbol
              name={post.has_liked ? "heart.fill" : "heart"}
              size={24}
              color={post.has_liked ? "#EF4444" : isDark ? "white" : "#333"}
            />
          </Pressable>
          <Box className="w-8">
            {post.likes_count > 0 && (
              <Text className="text-sm font-bold text-typography-900">
                {post.likes_count}
              </Text>
            )}
          </Box>
        </HStack>
        <HStack className="items-center gap-1">
          <Pressable onPress={() => onCommentPress(post)} className="p-1">
            <IconSymbol
              name="bubble.right"
              size={22}
              color={isDark ? "white" : "#333"}
            />
          </Pressable>
          <Box className="w-8">
            {post.comments_count > 0 && (
              <Pressable onPress={() => onCommentPress(post)}>
                <Text className="text-sm font-bold text-typography-900">
                  {post.comments_count}
                </Text>
              </Pressable>
            )}
          </Box>
        </HStack>
      </HStack>

      {/* Info & Caption */}
      <VStack className="my-2 gap-1 px-3">
        {post.content && (
          <Text className="text-typography-800">{post.content}</Text>
        )}
      </VStack>
    </VStack>
  );
}
