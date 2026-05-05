import { fetchMeetingsByMonth } from "@/services/MeetingApi";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Center } from "../ui/center";
import { Text } from "../ui/text";
import MeetingPreviewCard from "./MeetingPreviewCard";

interface UpcomingMeetingProps {
  groupId: string;
}

export default function UpcomingMeeting({ groupId }: UpcomingMeetingProps) {
  const { t } = useTranslation();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings", groupId],
    queryFn: () => fetchMeetingsByMonth(groupId, new Date()),
  });

  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.meeting_time) > new Date(),
  );

  return upcomingMeetings.length === 0 ? (
    <Center className="max-h-[300px] min-h-[100px] rounded-xl bg-background-200/50">
      <Text className="text-gray-400">
        {t("community.no_upcoming_meeting")}
      </Text>
    </Center>
  ) : (
    <MeetingPreviewCard item={upcomingMeetings[0]} />
  );
}
