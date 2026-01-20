import { supabase } from "@/lib/supabase";
import { Platform } from "react-native";

export async function updatePushToken(token: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "User not authenticated" };

  // We'll attempt to insert into user_push_tokens.
  // If the table doesn't exist yet, this will fail gracefully.
  // Ideally, this table should be created as per the guide.
  if (user) {
    const { error } = await supabase.from("user_push_tokens").upsert(
      {
        user_id: user.id,
        token,
        device_type: Platform.OS,
      },
      { onConflict: "user_id, token" },
    );

    if (error) {
      console.error("Error saving push token:", error);
      // If table not found, ignoring for now as per plan
      return { success: false, error: error.message };
    }
    return { success: true };
  }
}
