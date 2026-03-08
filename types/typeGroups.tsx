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

export interface Diary {
  id: string;
  group_id: string;
  writer_id: string;
  title: string;
  content: string;
  created_at: string;
}
