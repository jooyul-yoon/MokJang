import { supabase } from "@/lib/supabase";
import { Group } from "@/types/typeGroups";

export const fetchGroups = async (): Promise<Group[]> => {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
  return data as Group[];
};

export const joinGroup = async (
  groupId: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("group_join_requests").insert({
    user_id: user.id,
    group_id: groupId,
  });

  if (error) {
    console.error("Error joining group:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const fetchUserJoinRequests = async (): Promise<string[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("group_join_requests")
    .select("group_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching join requests:", error);
    return [];
  }
  return data.map((req: any) => req.group_id);
};

export const fetchMyGroups = async (): Promise<Group[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(*)")
    .eq("user_id", user.id);

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 is "The result contains 0 rows"
      console.error("Error fetching user group:", error);
    }
    return [];
  }

  return data.map((item: any) => item.groups);
};
