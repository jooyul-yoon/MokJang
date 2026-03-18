import React, { useRef } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePost } from '@/hooks/useFeeds/useFeed';
import { Post } from '@/api/feeds/queries';
import FeedItem from '@/components/feeds/FeedItem';
import { CommentsSheet, CommentsSheetRef } from '@/components/feeds/CommentsSheet';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const router = useRouter();
  
  const commentsSheetRef = useRef<CommentsSheetRef>(null);
  const { data: post, isLoading, isError } = usePost(id as string);

  const handleCommentPress = (post: Post) => {
    commentsSheetRef.current?.present(post.id);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !post) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
        <Text>{t('common.unexpected_error')}</Text>
        <Pressable onPress={() => router.back()} className="mt-4 p-2">
          <Text className="text-primary-500 font-bold">{t('common.back', { defaultValue: 'Back' })}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark py-2">
      <VStack className="flex-1">
        {/* Header */}
        <HStack className="items-center px-4 pb-4 border-b border-outline-100 dark:border-outline-800">
          <Pressable onPress={() => router.back()} className="p-1 mr-4">
            <IconSymbol name="chevron.left" size={24} color="gray" />
          </Pressable>
          <Text className="font-bold text-lg">{t('community.feeds')}</Text>
        </HStack>

        <ScrollView className="flex-1">
          <Box className="pt-4">
            <FeedItem post={post} onCommentPress={handleCommentPress} />
          </Box>
        </ScrollView>
      </VStack>

      <CommentsSheet ref={commentsSheetRef} />
    </SafeAreaView>
  );
}
