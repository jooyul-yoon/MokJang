import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import {
  PrayerRequest,
  prayerRequestCategories,
} from "@/types/typePrayerRequest";
import {
  Activity,
  BookOpen,
  Briefcase,
  CheckCircle,
  Droplet,
  Home,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  request: PrayerRequest;
  disableVisibility?: Boolean;
}

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case "general":
      return MessageCircle;
    case "health":
      return Activity;
    case "studies":
      return BookOpen;
    case "family":
      return Home;
    case "work":
      return Briefcase;
    case "job":
      return Search;
    case "other":
    default:
      return MoreHorizontal;
  }
};

export function PrayerRequestBadges({
  request,
  disableVisibility = false,
}: Props) {
  const { t, i18n } = useTranslation();

  const categoryId =
    typeof request.category === "string"
      ? request.category
      : request.category?.id;
  const categoryObj =
    (prayerRequestCategories as any)[categoryId || "general"] ||
    (prayerRequestCategories as any).general;

  return (
    <HStack className="items-center gap-2">
      {!disableVisibility && (
        <Badge size="sm" className="gap-1 rounded-full bg-background-100">
          <BadgeIcon
            as={request.visibility === "private" ? Lock : Users}
            className="text-typography-600"
          />
          {request.visibility === "private" ? (
            <BadgeText className="font-medium text-typography-600">
              {t("common.private")}
            </BadgeText>
          ) : (
            <BadgeText className="font-medium text-typography-600">
              {t("common.group")}
            </BadgeText>
          )}
        </Badge>
      )}
      <Badge
        size="sm"
        className={`gap-1 rounded-full ${
          request.is_answered
            ? "bg-success-100 dark:bg-success-50/50"
            : "bg-warning-100 dark:bg-warning-50/50"
        }`}
      >
        <BadgeIcon
          as={request.is_answered ? CheckCircle : Droplet}
          className={
            request.is_answered
              ? "text-success-600 dark:text-success-900"
              : "text-warning-600 dark:text-warning-900"
          }
        />
        <BadgeText
          className={`font-medium ${
            request.is_answered
              ? "text-success-700 dark:text-success-900"
              : "text-warning-700 dark:text-warning-900"
          }`}
        >
          {request.is_answered
            ? t("prayerBoard.answered", "응답됨")
            : t("prayerBoard.praying", "기도중")}
        </BadgeText>
      </Badge>
      {categoryObj && (
        <Badge
          style={{ backgroundColor: categoryObj.color + "1A" }}
          className="gap-1 rounded-full"
          size="sm"
        >
          <BadgeIcon
            as={getCategoryIcon(categoryId)}
            style={{
              color: prayerRequestCategories[categoryId].color,
            }}
          />
          <BadgeText
            style={{ color: categoryObj.color }}
            className="text-[10px] font-bold uppercase"
          >
            {categoryObj[i18n.language]}
          </BadgeText>
        </Badge>
      )}
    </HStack>
  );
}
