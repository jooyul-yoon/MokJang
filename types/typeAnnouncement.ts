export type AnnouncementType = "news" | "meeting" | "retreat" | "picnic";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read_count?: number;
  type: AnnouncementType;
  is_read?: boolean;
  author_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}
