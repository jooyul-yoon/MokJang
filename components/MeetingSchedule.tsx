import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Group, Meeting } from "@/services/api";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "./ui/pressable";

interface MeetingScheduleProps {
  userGroup: Group;
  meetings: Meeting[];
}

export default function MeetingSchedule({
  userGroup,
  meetings,
}: MeetingScheduleProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const previewMeetings = meetings.slice(0, 3); // Show top 3 only

  return (
    <VStack className="gap-4">
      <HStack className="items-center justify-between px-4">
        <Heading
          size="lg"
          className="text-lg text-typography-black dark:text-typography-white"
        >
          {t("community.upcomingMeetings")}
        </Heading>
        <Button
          size="sm"
          variant="link"
          action="primary"
          onPress={() => router.push("/community/meetings")}
        >
          <ButtonText className="underline">{t("common.more")}</ButtonText>
        </Button>
      </HStack>

      <VStack className="px-4">
        {previewMeetings.length > 0 ? (
          previewMeetings.map((meeting: Meeting) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/community/meetings",
                  params: { date: meeting.meeting_time.split("T")[0] },
                })
              }
              key={meeting.id}
              className="border-b border-background-100 active:bg-background-50 dark:border-background-50"
            >
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
                      <Text className="text-sm italic text-typography-500">
                        {t("community.tbd")}
                      </Text>
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
            </Pressable>
          ))
        ) : (
          <Text className="text-typography-500">
            {t("community.noUpcomingMeetings")}
          </Text>
        )}
      </VStack>
    </VStack>
  );
}
