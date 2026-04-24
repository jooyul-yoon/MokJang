import { Badge, BadgeText } from "@/components/ui/badge";
import React from "react";

export function getAnnouncementTagStyle(type: string) {
  let tagStyle = {
    tagText: "NEWS",
    tagColor: "text-amber-500",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    darkBgColor: "dark:bg-amber-900/20",
  };

  switch (type) {
    case "meeting":
      tagStyle = {
        tagText: "MEETING",
        tagColor: "text-blue-500",
        dotColor: "bg-blue-500",
        bgColor: "bg-blue-50",
        darkBgColor: "dark:bg-blue-900/20",
      };
      break;
    case "retreat":
      tagStyle = {
        tagText: "RETREAT",
        tagColor: "text-green-500",
        dotColor: "bg-green-500",
        bgColor: "bg-green-50",
        darkBgColor: "dark:bg-green-900/20",
      };
      break;
    case "picnic":
      tagStyle = {
        tagText: "PICNIC",
        tagColor: "text-orange-500",
        dotColor: "bg-orange-500",
        bgColor: "bg-orange-50",
        darkBgColor: "dark:bg-orange-900/20",
      };
      break;
  }

  return tagStyle;
}

interface AnnouncementBadgeProps {
  type: string;
}

export function AnnouncementBadge({ type }: AnnouncementBadgeProps) {
  const tagStyle = getAnnouncementTagStyle(type);

  return (
    <Badge
      className={`rounded-pill border-0 px-2 py-1 ${tagStyle.bgColor} ${tagStyle.darkBgColor}`}
    >
      <BadgeText className={`text-xs font-bold ${tagStyle.tagColor} border-0`}>
        {tagStyle.tagText}
      </BadgeText>
    </Badge>
  );
}
