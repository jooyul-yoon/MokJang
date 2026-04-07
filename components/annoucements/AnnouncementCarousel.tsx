import { Announcement } from "@/types/typeAnnouncement";
import { format } from "date-fns";
import { router } from "expo-router";
import { Megaphone } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity } from "react-native";
import { Box } from "../ui/box";
import { Center } from "../ui/center";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

interface IAnnouncementCarousel {
  announcements?: Announcement[];
}

export default function AnnouncementCarousel({
  announcements,
}: IAnnouncementCarousel) {
  const { t } = useTranslation();

  const renderItem = ({
    item,
    index,
  }: {
    item: Announcement;
    index: number;
  }) => {
    const dateText = item.created_at
      ? format(new Date(item.created_at), "MMM d")
      : "";

    const isLast = index === (announcements?.length ?? 0) - 1;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/announcements/${item.id}`)}
      >
        <HStack className="px-1 pt-4">
          <VStack className="relative mr-4 mt-2 items-center">
            <Text className="mb-2 text-xs font-semibold text-gray-400">
              {dateText}
            </Text>
            <Box className="z-10 h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Megaphone size={16} color="#467CFA" />
            </Box>
            {!isLast && (
              <Box className="-mb-4 mt-2 w-[1.5px] flex-1 bg-gray-200 dark:bg-gray-800" />
            )}
          </VStack>

          <VStack className="flex-1 pb-4">
            <VStack className="mb-1 items-start justify-between">
              <Heading
                size="sm"
                className="shrink text-lg font-bold text-gray-900 dark:text-white"
                numberOfLines={1}
              >
                {item.title}
              </Heading>
            </VStack>

            <Text
              className="leading-normal text-gray-700 dark:text-gray-300"
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {item.content}
            </Text>
          </VStack>
        </HStack>
      </TouchableOpacity>
    );
  };

  return (
    <VStack className="my-4 px-2" space="md">
      <HStack className="items-center justify-between">
        <Heading size="lg" className="font-bold text-gray-900 dark:text-white">
          {t("announcements.title")}
        </Heading>
      </HStack>

      {announcements && announcements.length > 0 ? (
        <FlatList
          data={announcements}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        <Center className="h-24">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {t("announcements.no_announcements")}
          </Text>
        </Center>
      )}
    </VStack>
  );
}
