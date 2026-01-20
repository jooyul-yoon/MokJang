import { supabase } from "@/lib/supabase";

export const getNotifications = async () => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) return [];

  const { data: notifications, error } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];

  return notifications;
};

export const readNotification = async (notificationId: string) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) return;

  const { error } = await supabase
    .from("user_notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.log(error);
    return;
  }
};
