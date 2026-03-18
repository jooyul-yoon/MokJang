import { supabase } from '@/lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  group_id: string | null;
  content: string;
  images: string[];
  visibility: 'public' | 'group';
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
}

export const fetchFeeds = async ({ pageParam = 0, visibility, groupId, userId, authorId }: {
  pageParam: number;
  visibility?: 'public' | 'group';
  groupId?: string;
  userId: string;
  authorId?: string;
}) => {
  const PAGE_SIZE = 10;
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (full_name, avatar_url),
      post_likes (id, user_id),
      post_comments (id)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

  if (visibility === 'public') {
    query = query.eq('visibility', 'public');
  } else if (visibility === 'group' && groupId) {
    query = query.eq('visibility', 'group').eq('group_id', groupId);
  } else if (groupId) {
    query = query.eq('group_id', groupId);
  }

  if (authorId) {
    query = query.eq('user_id', authorId);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  // Process data to count likes/comments and check if current user liked
  const posts: Post[] = (data as any[]).map(post => ({
    ...post,
    likes_count: post.post_likes?.length || 0,
    comments_count: post.post_comments?.length || 0,
    has_liked: post.post_likes?.some((like: any) => like.user_id === userId) || false,
    // Cleanup the related arrays so we don't hold too much data
    post_likes: undefined,
    post_comments: undefined,
  }));

  return {
    posts,
    nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
};

export const toggleLike = async (postId: string, userId: string, hasLiked: boolean) => {
  if (hasLiked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
};

export const fetchPostById = async (postId: string, userId: string): Promise<Post> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (full_name, avatar_url),
      post_likes (id, user_id),
      post_comments (id)
    `)
    .eq('id', postId)
    .single();

  if (error) throw error;

  return {
    ...data,
    likes_count: data.post_likes?.length || 0,
    comments_count: data.post_comments?.length || 0,
    has_liked: data.post_likes?.some((like: any) => like.user_id === userId) || false,
    post_likes: undefined,
    post_comments: undefined,
  } as Post;
};
