import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { uploadFeedImage, createPost } from '@/api/feeds';

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      assetIds,
      content,
      visibility,
      groupId
    }: {
      assetIds: string[];
      content: string;
      visibility: 'public' | 'group';
      groupId: string | null;
    }) => {
      setIsUploading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Upload all images in parallel
        const uploadPromises = assetIds.map(id => uploadFeedImage(id, user.id));
        const uploadedUrls = await Promise.all(uploadPromises);

        // Create the post record
        const post = await createPost({
          userId: user.id,
          groupId: visibility === 'group' ? groupId : null,
          content,
          images: uploadedUrls,
          visibility,
        });

        return post;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      // Invalidate the feeds query to show new post
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
  });

  return {
    ...mutation,
    isUploading,
  };
};
