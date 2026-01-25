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
