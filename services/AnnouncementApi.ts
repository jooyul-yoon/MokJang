import { supabase } from "@/lib/supabase";
import { Announcement } from "@/types/typeAnnouncement";

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return [];
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  return data as unknown as Announcement[];
};

export interface Comment {
  id: string;
  announcement_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export const fetchComments = async (
  announcementId: string,
): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("announcement_comments")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      )
    `,
    )
    .eq("announcement_id", announcementId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data as Comment[];
};

export const createComment = async (
  announcementId: string,
  content: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("announcement_comments").insert({
    announcement_id: announcementId,
    user_id: user.id,
    content,
  });

  if (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

import { AnnouncementType } from "@/types/typeAnnouncement";

export const createAnnouncement = async (
  title: string,
  content: string,
  type: AnnouncementType = "news",
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("announcements").insert({
    title,
    content,
    type,
    author_id: user.id,
  });

  if (error) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const deleteAnnouncement = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};
