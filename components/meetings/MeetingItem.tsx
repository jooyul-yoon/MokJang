import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Meeting } from "@/services/api";
import { TFunction } from "i18next";
import React from "react";

interface MeetingItemProps {
  meeting: Meeting;
  t: TFunction;
  onVolunteer: (meeting: Meeting) => void;
}

export const MeetingItem: React.FC<MeetingItemProps> = ({
  meeting,
  t,
  onVolunteer,
}) => {
  return (
    <VStack>
      <Divider />
      <HStack className="dark:bg-background-card items-start justify-between rounded-lg py-3">
        <VStack className="flex-1 gap-1">
          <HStack className="items-center gap-2">
            <Text className="font-bold text-typography-black dark:text-typography-white">
              {meeting.title ||
                (meeting.type === "mokjang"
                  ? t("community.mokjangMeeting")
                  : t("community.generalMeeting"))}
            </Text>
          </HStack>

          <Text className="text-sm text-typography-600 dark:text-typography-400">
            {new Date(meeting.meeting_time).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Text>
          {meeting.memo && (
            <Text className="text-xs italic text-typography-500">
              {meeting.memo}
            </Text>
          )}
        </VStack>

        <VStack className="items-end gap-1">
          {(meeting.type === "mokjang" || meeting.host_id) &&
            (meeting.profiles ? (
              <VStack className="items-end">
                <Text className="text-sm text-typography-600 dark:text-typography-400">
                  👤 {meeting.profiles.full_name}
                </Text>
                <Text className="text-sm text-typography-600 dark:text-typography-400">
                  📍 {meeting.location || t("community.tbd")}
                </Text>
              </VStack>
            ) : (
              <Button
                size="xs"
                variant="outline"
                action="primary"
                onPress={() => onVolunteer(meeting)}
              >
                <ButtonText>{t("community.volunteer")}</ButtonText>
              </Button>
            ))}
          {meeting.type === "general" &&
            !meeting.host_id &&
            meeting.location && (
              <Text className="text-sm text-typography-600 dark:text-typography-400">
                📍 {meeting.location}
              </Text>
            )}
        </VStack>
      </HStack>
    </VStack>
  );
};
