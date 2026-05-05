import { Meeting } from "@/types/typeMeeting";
import { router } from "expo-router";
import { CalendarDays, MapPin } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
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
  if (lang === "en") language = "en-US";
  const date = new Date(dateString);
  return date.toLocaleTimeString(language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: language === "en-US",
  });
};

export default function MeetingPreviewCard({ item }: { item: Meeting }) {
  console.log(item);
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => router.push(`/community/meetings/${item.id}`)}
    >
      <VStack space="sm" className="border-l border-primary-500 pl-2">
        <HStack space="md" className="mt-1 items-center">
          <HStack space="xs" className="items-center">
            <Icon as={CalendarDays} size="sm" className="text-primary-500" />
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
          <Text className="mt-1 text-xs text-typography-400" numberOfLines={2}>
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
    </TouchableOpacity>
  );
}
