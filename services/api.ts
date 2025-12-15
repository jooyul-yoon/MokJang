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
}

export interface Meeting {
  id: string;
  group_id: string;
  title: string;
  meeting_time: string;
  location: string;
  created_at: string;
  host_id: string;
  profiles?: {
    full_name: string;
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
  // 1. Get group schedule
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("meeting_day, meeting_hour, region")
    .eq("id", groupId)
    .single();

  if (groupError || !group || !group.meeting_day || !group.meeting_hour) {
    console.error("No schedule found or error:", groupError);
    return [];
  }

  // 2. Generate next 4 weeks of meetings
  const days: { [key: string]: number } = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDay = days[group.meeting_day];
  const [hour, minute, second] = group.meeting_hour.split(":").map(Number);

  const generatedMeetings: Meeting[] = [];
  const now = new Date();
  let current = new Date(now);

  // Find next occurrence of targetDay
  // If today is the target day, check if the time has passed.
  // If time has passed, move to next week.
  // If today is not target day, move to next target day.

  // Reset time to check day difference correctly
  const currentDay = current.getDay();
  let daysUntilTarget = (targetDay - currentDay + 7) % 7;

  // If it's today (0 days diff), check if time has passed
  if (daysUntilTarget === 0) {
    const meetingTimeToday = new Date(current);
    meetingTimeToday.setHours(hour, minute, second || 0, 0);
    if (now > meetingTimeToday) {
      daysUntilTarget = 7;
    }
  }

  current.setDate(current.getDate() + daysUntilTarget);
  current.setHours(hour, minute, second || 0, 0);

  for (let i = 0; i < 4; i++) {
    generatedMeetings.push({
      id: `generated-${current.toISOString()}`, // Temporary ID
      group_id: groupId,
      title: "", // Default to empty, will show Mokjang in UI
      meeting_time: current.toISOString(),
      location: "", // Default to empty, will show TBD in UI
      created_at: new Date().toISOString(),
      host_id: "", // Empty initially
    });
    // Add 7 days for next week
    current.setDate(current.getDate() + 7);
  }

  // 3. Fetch overrides/details from DB
  // We fetch meetings that match the generated dates (or roughly in range)
  const startRange = generatedMeetings[0].meeting_time;
  const endRange = generatedMeetings[generatedMeetings.length - 1].meeting_time;

  // Add a small buffer to endRange to ensure we catch the last one
  const endDate = new Date(endRange);
  endDate.setHours(endDate.getHours() + 1);

  const { data: dbMeetings, error: dbError } = await supabase
    .from("meetings")
    .select("*, profiles(full_name)")
    .eq("group_id", groupId);
  // .gte("meeting_time", new Date().toISOString()); // Widen range for debugging

  if (dbError) {
    console.error("Error fetching db meetings:", dbError);
  }

  // 4. Merge
  const mergedMeetings = generatedMeetings.map((gen) => {
    // Find matching DB record (fuzzy match on time could be safer, but let's try exact ISO string match first.
    // Actually, ISO strings might differ by milliseconds or timezone formatting.
    // Safer to match by timestamp within a small window (e.g. same minute).

    const genTime = new Date(gen.meeting_time).getTime();

    const match = dbMeetings?.find((db) => {
      const dbTime = new Date(db.meeting_time).getTime();
      return Math.abs(dbTime - genTime) < 60000; // Match within 1 minute
    });

    if (match) {
      return {
        ...gen,
        ...match, // Override with DB data (id, title, location, host_id, profiles)
      };
    }
    return gen;
  });

  return mergedMeetings;
};

export const volunteerForMeeting = async (
  meeting: Meeting,
  location: string,
): Promise<{ success: boolean; error?: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  // If it's a generated meeting, we need to insert a new record
  if (meeting.id.startsWith("generated-")) {
    const { error } = await supabase.from("meetings").insert({
      group_id: meeting.group_id,
      title: meeting.title || "목장모임", // Use default title if empty
      meeting_time: meeting.meeting_time,
      location: location,
      host_id: user.id,
    });

    if (error) {
      console.error("Error creating meeting:", error);
      return { success: false, error: error.message };
    }
  } else {
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
