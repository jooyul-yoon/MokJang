import { Meeting } from "@/types/typeMeeting";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Center } from "../ui/center";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import MeetingPreviewCard from "./MeetingPreviewCard";

interface SelectedDateMeetingsProps {
  meetings: Meeting[];
  selectedDate: string;
}

export default function SelectedDateMeetings({
  meetings,
  selectedDate,
}: SelectedDateMeetingsProps) {
  const { t } = useTranslation();

  const selectedDateMeetings = useMemo(() => {
    return meetings
      .filter(
        (meeting) =>
          new Date(meeting.meeting_time).toLocaleDateString("sv-SE") ===
          selectedDate,
      )
      .sort(
        (a, b) =>
          new Date(a.meeting_time).getTime() -
          new Date(b.meeting_time).getTime(),
      )
      .slice(0, 3);
  }, [meetings, selectedDate]);

  if (selectedDateMeetings.length === 0) {
    return (
      <Center className="mr-4 flex-1 rounded-xl bg-background-50">
        <Text className="text-gray-400">{t("community.noMeetings")}</Text>
      </Center>
    );
  }

  return (
    <VStack space="md">
      {selectedDateMeetings.map((item) => (
        <MeetingPreviewCard key={item.id} item={item} />
      ))}
    </VStack>
  );
}
