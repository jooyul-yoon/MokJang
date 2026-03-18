import React from 'react';
import { FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFeeds } from '@/hooks/useFeeds/useFeed';
import { Post } from '@/api/feeds/queries';
import FeedItem from './FeedItem';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

interface FeedListProps {
  visibility?: 'public' | 'group';
  groupId?: string;
  onCommentPress: (post: Post) => void;
  ListHeaderComponent?: React.ReactElement | null;
}

export default function FeedList({ visibility, groupId, onCommentPress, ListHeaderComponent }: FeedListProps) {
  const { t } = useTranslation();
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    isError, 
    refetch, 
    isRefetching 
  } = useFeeds({ visibility, groupId });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

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
        <Text>{t('common.unexpected_error')}</Text>
        <Text className="text-primary-500 mt-2" onPress={() => refetch()}>Tap to retry</Text>
      </Box>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FeedItem post={item} onCommentPress={onCommentPress} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <VStack className="flex-1 items-center justify-center py-20 px-4">
          <Text className="text-typography-500 text-center">{t('community.no_feed')}</Text>
        </VStack>
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Box className="p-4 items-center">
            <ActivityIndicator />
          </Box>
        ) : null
      }
    />
  );
}
