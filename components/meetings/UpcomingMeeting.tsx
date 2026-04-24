import { Meeting } from "@/types/typeMeeting";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";
import { Center } from "../ui/center";
import { Text } from "../ui/text";
import MeetingPreviewCard from "./MeetingPreviewCard";

const formatTime = (dateString: string, lang: string = "ko") => {
  let language = "ko-KR";
  if (lang === "en") {
    language = "en-US";
  }
  const date = new Date(dateString);
  return date.toLocaleTimeString(language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

interface UpcomingMeetingProps {
  meetings: Meeting[];
}

export default function UpcomingMeeting({ meetings }: UpcomingMeetingProps) {
  const { t } = useTranslation();
  const upcomingMeetings = meetings
    .filter((meeting) => new Date(meeting.meeting_time) > new Date())
    .sort(
      (a, b) =>
        new Date(a.meeting_time).getTime() - new Date(b.meeting_time).getTime(),
    );

  return upcomingMeetings.length === 0 ? (
    <Center className="max-h-[300px] min-h-[100px] rounded-xl bg-background-200/50">
      <Text className="text-gray-400">
        {t("community.no_upcoming_meeting")}
      </Text>
    </Center>
  ) : (
    <FlatList
      data={upcomingMeetings.slice(0, 2)}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={{ gap: 12 }}
      renderItem={({ item }) => <MeetingPreviewCard item={item} />}
    />
  );
}
