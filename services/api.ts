import { supabase } from "@/lib/supabase";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read_count?: number;
  is_read?: boolean;
  author_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string;
  meeting_time: string;
  region: string;
  meeting_day: string | null;
  meeting_hour: string | null;
  leader_id: string;
}

export interface Meeting {
  id: string;
  group_id: string;
  title: string;
  meeting_time: string;
  location?: string;
  created_at: string;
  host_id: string | null;
  type: "mokjang" | "general";
  memo?: string;
  profiles?: {
    full_name: string;
  };
}

export interface JoinRequest {
  id: string;
  user_id: string;
  group_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("User not authenticated");
    return [];
  }

  const { data, error } = await supabase.rpc("get_announcements_with_reads", {
    current_user_id: user.id,
  });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  // Map the RPC result to match the Announcement interface structure expected by UI
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    created_at: item.created_at,
    read_count: item.read_count,
    is_read: item.is_read,
    author_id: item.author_id,
    comment_count: item.comment_count || 0,
    profiles: {
      full_name: item.author_full_name,
      avatar_url: item.author_avatar_url,
    },
  })) as Announcement[];
};

export const markAnnouncementAsRead = async (
  announcementId: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("announcement_reads").insert({
    announcement_id: announcementId,
    user_id: user.id,
  });

  if (error) {
    // If unique violation, it means already read, which is fine.
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Error marking announcement as read:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
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

export const fetchUserGroup = async (): Promise<Group | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(*)")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 is "The result contains 0 rows"
      console.error("Error fetching user group:", error);
    }
    return null;
  }

  return data?.groups as unknown as Group;
};

export const fetchMeetings = async (groupId: string): Promise<Meeting[]> => {
  const { data, error } = await supabase
    .from("meetings")
    .select("*, profiles(full_name)")
    .eq("group_id", groupId)
    .order("meeting_time", { ascending: true });

  if (error) {
    console.error("Error fetching meetings:", error);
    return [];
  }

  return data as Meeting[];
};

export interface CreateMeetingDTO {
  group_id: string;
  type: "mokjang" | "general";
  title: string;
  meeting_time: string;
  location?: string;
  memo?: string;
}

export const createMeeting = async (
  data: CreateMeetingDTO,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("meetings").insert({
    ...data,
    // Let's leave host_id as null for now to be safe, unless user explicitly "volunteers" during creation (which isn't in requirements yet).
    // Wait, createMeeting was commented out below? No, it was just non-existent or different.
  });

  if (error) {
    console.error("Error creating meeting:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const volunteerForMeeting = async (
  meeting: Meeting,
  location: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  // Existing meeting, update it
  const { error } = await supabase
    .from("meetings")
    .update({
      host_id: user.id,
      location: location,
    })
    .eq("id", meeting.id);

  if (error) {
    console.error("Error updating meeting:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  return data as UserProfile;
};

export const createAnnouncement = async (
  title: string,
  content: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase.from("announcements").insert({
    title,
    content,
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

export const fetchGroupRequests = async (
  groupId: string,
): Promise<JoinRequest[]> => {
  const { data, error } = await supabase
    .from("group_join_requests")
    .select("*, profiles(full_name, avatar_url)")
    .eq("group_id", groupId);

  if (error) {
    console.error("Error fetching group requests:", error);
    return [];
  }
  return data as unknown as JoinRequest[];
};

export const approveJoinRequest = async (
  requestId: string,
  groupId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> => {
  // 1. Insert into group_members
  const { error: insertError } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: userId,
  });

  if (insertError) {
    console.error("Error approving request (insert):", insertError);
    return { success: false, error: insertError.message };
  }

  // 2. Delete from group_join_requests
  const { error: deleteError } = await supabase
    .from("group_join_requests")
    .delete()
    .eq("id", requestId);

  if (deleteError) {
    console.error("Error approving request (delete):", deleteError);
    // Ideally we'd rollback here, but for now we'll just log it.
    // The user is in the group, so it's mostly a cleanup issue.
  }

  return { success: true };
};

export const rejectJoinRequest = async (
  requestId: string,
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from("group_join_requests")
    .delete()
    .eq("id", requestId);

  if (error) {
    console.error("Error rejecting request:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const deleteAccount = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  const { error } = await supabase.rpc("delete_user");

  if (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: error.message };
  }

  // Sign out after deletion to clear local session
  await supabase.auth.signOut();
  return { success: true };
};

export interface GroupMember {
  user_id: string;
  joined_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export const fetchGroupMembers = async (
  groupId: string,
): Promise<GroupMember[]> => {
  // 1. Fetch group members (user_ids)
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("user_id, joined_at")
    .eq("group_id", groupId);

  if (membersError) {
    console.error("Error fetching group members:", membersError);
    return [];
  }

  if (!members || members.length === 0) return [];

  const userIds = members.map((m: any) => m.user_id);

  // 2. Fetch profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    console.error("Error fetching member profiles:", profilesError);
    return [];
  }

  // 3. Merge data
  const profileMap = new Map(profiles.map((p: any) => [p.id, p]));

  return members.map((member: any) => {
    const profile = profileMap.get(member.user_id);
    return {
      user_id: member.user_id,
      joined_at: member.joined_at,
      profiles: {
        full_name: profile?.full_name || "Unknown",
        avatar_url: profile?.avatar_url || "",
      },
    };
  });
};

export const leaveGroup = async (
  groupId: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error leaving group:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export interface PrayerRequest {
  id: string;
  user_id: string;
  group_id: string | null;
  content: string;
  visibility: "public" | "group";
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
  comment_count?: number;
}

export interface PrayerRequestComment {
  id: string;
  prayer_request_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

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
    console.error("Error fetching prayer requests:", error.message, error.details, error.hint);
    return [];
  }

  return data as PrayerRequest[];
};

export const createPrayerRequest = async (
  content: string,
  visibility: "public" | "group",
  groupId: string | null,
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
