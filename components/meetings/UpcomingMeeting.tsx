import { Meeting } from "@/types/typeMeeting";
import { CalendarDays, MapPin } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";
import { Center } from "../ui/center";
import { HStack } from "../ui/hstack";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

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
  const { i18n } = useTranslation();
  const upcomingMeetings = meetings
    .filter((meeting) => new Date(meeting.meeting_time) > new Date())
    .sort(
      (a, b) =>
        new Date(a.meeting_time).getTime() - new Date(b.meeting_time).getTime(),
    );

  return upcomingMeetings.length === 0 ? (
    <Center className="h-[100px] rounded-xl bg-background-50">
      <Text className="text-gray-400">예정된 모임이 없습니다</Text>
    </Center>
  ) : (
    <VStack className="mt-4">
      <FlatList
        data={upcomingMeetings.slice(0, 3)}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <VStack space="sm" className="border-l border-primary-500 pl-2">
            <HStack space="md" className="mt-1 items-center">
              <HStack space="xs" className="items-center">
                <Icon
                  as={CalendarDays}
                  size="sm"
                  className="text-primary-500"
                />
                <Text className="text-sm font-medium text-typography-600">
                  {formatDate(item.meeting_time)}
                </Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <Text className="text-sm font-medium text-typography-600">
                  {formatTime(item.meeting_time)}
                </Text>
              </HStack>
            </HStack>
            <HStack className="items-start justify-between">
              <Text className="mr-2 flex-1 font-bold text-typography-900">
                {item.title}
              </Text>
            </HStack>

            {item.memo && (
              <Text
                className="mt-1 text-xs text-typography-400"
                numberOfLines={2}
              >
                {item.memo}
              </Text>
            )}

            {item.location && (
              <HStack space="xs" className="items-center">
                <Icon as={MapPin} size="sm" className="text-typography-400" />
                <Text
                  className="flex-1 text-sm text-typography-700"
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </HStack>
            )}
          </VStack>
        )}
      />
    </VStack>
  );
}
