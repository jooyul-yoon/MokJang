export interface PrayerRequest {
  id: string;
  user_id: string;
  group_id: string | null;
  content: string;
  category: PrayerRequestCategory;
  visibility: "public" | "group" | "private";
  created_at: string;
  is_answered: boolean;
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

export interface PrayerRequestCategory {
  id: "general" | "health" | "studies" | "family" | "work" | "job" | "other";
  ko: string;
  en: string;
  color: string;
}

export const prayerRequestCategories: Record<string, PrayerRequestCategory> = {
  general: {
    id: "general",
    ko: "일반",
    en: "general",
    color: "#60a5fa",
  },
  health: {
    id: "health",
    ko: "건강",
    en: "health",
    color: "#f87171",
  },
  studies: {
    id: "studies",
    ko: "학업",
    en: "studies",
    color: "#fbbf24",
  },
  family: {
    id: "family",
    ko: "가족",
    en: "family",
    color: "#a855f7",
  },
  work: {
    id: "work",
    ko: "직장",
    en: "work",
    color: "#3b82f6",
  },
  job: {
    id: "job",
    ko: "취업",
    en: "job",
    color: "#10b981",
  },
  other: {
    id: "other",
    ko: "기타",
    en: "other",
    color: "#9ca3af",
  },
};
