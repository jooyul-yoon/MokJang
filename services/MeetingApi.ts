import { supabase } from "@/lib/supabase";
import { Meeting } from "@/types/typeMeeting";
import { endOfMonth, startOfMonth } from "date-fns";

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

export const fetchUpcomingMeetings = async (
  groupId: string,
): Promise<Meeting[]> => {
  const { data, error } = await supabase
    .from("meetings")
    .select("*, profiles(full_name)")
    .eq("group_id", groupId)
    .order("meeting_time", { ascending: true })
    .gt("meeting_time", new Date().toISOString());

  if (error) {
    console.error("Error fetching meetings:", error);
    return [];
  }

  return data as Meeting[];
};

export const fetchMeetingsByMonth = async (
  groupId: string,
  date: Date,
): Promise<Meeting[]> => {
  const startDate = startOfMonth(date).toISOString();
  const endDate = endOfMonth(date).toISOString();

  const { data, error } = await supabase
    .from("meetings")
    .select("*, profiles(full_name)")
    .eq("group_id", groupId)
    .gte("meeting_time", startDate)
    .lte("meeting_time", endDate)
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
  host_id: string | null;
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
