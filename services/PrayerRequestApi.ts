import { supabase } from "@/lib/supabase";
import { PrayerRequest, PrayerRequestComment } from "@/types/typePrayerRequest";

export const fetchPrayerRequests = async (): Promise<PrayerRequest[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Error fetching prayer requests:",
      error.message,
      error.details,
      error.hint,
    );
    return [];
  }

  return data as PrayerRequest[];
};

export const createPrayerRequest = async (
  content: string,
  visibility: "public" | "group" | "private",
  groupId: string | null,
  category: string | null,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("prayer_requests").insert({
    user_id: user.id,
    content,
    visibility,
    group_id: groupId,
    category,
  });

  if (error) {
    console.error("Error creating prayer request:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const deletePrayerRequest = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from("prayer_requests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting prayer request:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const togglePrayerRequestAnswered = async (
  id: string,
  isAnswered: boolean,
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from("prayer_requests")
    .update({ is_answered: isAnswered })
    .eq("id", id);

  if (error) {
    console.error("Error updating prayer request status:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const fetchPrayerRequestComments = async (
  requestId: string,
): Promise<PrayerRequestComment[]> => {
  const { data, error } = await supabase
    .from("prayer_request_comments")
    .select("*, profiles(full_name, avatar_url)")
    .eq("prayer_request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching request comments:", error);
    return [];
  }
  return data as PrayerRequestComment[];
};

export const createPrayerRequestComment = async (
  requestId: string,
  content: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("prayer_request_comments").insert({
    prayer_request_id: requestId,
    user_id: user.id,
    content,
  });

  if (error) {
    console.error("Error creating request comment:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const fetchMyPrayerRequests = async (): Promise<PrayerRequest[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*, profiles(full_name, avatar_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching my prayer requests:", error);
    return [];
  }

  return data as PrayerRequest[];
};
