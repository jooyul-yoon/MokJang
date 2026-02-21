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

export interface MeetingAttendance {
  id: string;
  meeting_id: string;
  user_id: string;
  status: "attending" | "absent";
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}
