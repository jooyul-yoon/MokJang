import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

export const fetchComments = async (postId: string) => {
  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `
      *,
      profiles!post_comments_user_id_fkey (full_name, avatar_url)
    `,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Transform flat list to tree
  const commentsMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  (data as any[]).forEach((item) => {
    commentsMap.set(item.id, { ...item, replies: [] });
  });

  (data as any[]).forEach((item) => {
    if (item.parent_id) {
      const parent = commentsMap.get(item.parent_id);
      if (parent) {
        parent.replies?.push(commentsMap.get(item.id)!);
      }
    } else {
      rootComments.push(commentsMap.get(item.id)!);
    }
  });

  return rootComments;
};

export const addComment = async (
  postId: string,
  userId: string,
  content: string,
  parentId?: string,
) => {
  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: userId,
      parent_id: parentId || null,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const useComments = (postId: string | null) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId!),
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      parentId,
    }: {
      postId: string;
      content: string;
      parentId?: string;
    }) => {
      if (!currentUserId) throw new Error("Not authenticated");
      return addComment(postId, currentUserId, content, parentId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
  });
};
