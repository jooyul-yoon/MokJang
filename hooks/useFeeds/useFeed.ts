import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { fetchFeeds, toggleLike, fetchPostById, deletePost } from '@/api/feeds/queries';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export const useFeeds = (options?: { visibility?: 'public' | 'group', groupId?: string, authorId?: string }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const queryInfo = useInfiniteQuery({
    queryKey: ['feeds', options?.visibility, options?.groupId, options?.authorId],
    queryFn: ({ pageParam = 0 }) => fetchFeeds({ 
      pageParam, 
      visibility: options?.visibility, 
      groupId: options?.groupId,
      authorId: options?.authorId,
      userId: currentUserId || ''
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!currentUserId,
  });

  return queryInfo;
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  return useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string, hasLiked: boolean }) => {
      if (!currentUserId) throw new Error('Not authenticated');
      await toggleLike(postId, currentUserId, hasLiked);
    },
    onMutate: async ({ postId, hasLiked }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['feeds'] });

      // Snapshot the previous value
      const previousFeeds = queryClient.getQueryData(['feeds']);

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ['feeds'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => {
              if (post.id === postId) {
                return {
                  ...post,
                  has_liked: !hasLiked,
                  likes_count: hasLiked ? post.likes_count - 1 : post.likes_count + 1,
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousFeeds };
    },
    onError: (err, variables, context) => {
      if (context?.previousFeeds) {
        queryClient.setQueriesData({ queryKey: ['feeds'] }, context.previousFeeds);
      }
    },
    onSettled: () => {
      // Still invalidate to ensure we are in sync with the server, 
      // but the optimistic update handles the immediate UI change.
      // queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
};

export const usePost = (postId: string) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPostById(postId, currentUserId!),
    enabled: !!currentUserId && !!postId,
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
};
