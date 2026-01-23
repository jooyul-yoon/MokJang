import { Announcement } from "@/types/typeAnnouncement";
import { format } from "date-fns";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity } from "react-native";
import { Box } from "../ui/box";
import { Card } from "../ui/card";
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

  const renderItem = ({ item }: { item: Announcement }) => {
    let tagStyle = {
      tagText: "NEWS",
      tagColor: "text-amber-500",
      dotColor: "bg-amber-500",
    };
    switch (item.type) {
      case "meeting":
        tagStyle = {
          tagText: "MEETING",
          tagColor: "text-blue-500",
          dotColor: "bg-blue-500",
        };
        break;
      case "retreat":
        tagStyle = {
          tagText: "RETREAT",
          tagColor: "text-green-500",
          dotColor: "bg-green-500",
        };
        break;
      case "picnic":
        tagStyle = {
          tagText: "PICNIC",
          tagColor: "text-orange-500",
          dotColor: "bg-orange-500",
        };
        break;
    }

    const dateText = item.created_at
      ? format(new Date(item.created_at), "MMM d, yyyy")
      : "";

    return (
      <Card
        className="shadow-xs mr-4 w-72 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/50"
        variant="elevated"
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/announcements/${item.id}`)}
        >
          <VStack space="md">
            {/* Tag */}
            <HStack space="xs" className="items-center">
              <Box className={`h-2 w-2 rounded-full ${tagStyle.dotColor}`} />
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${tagStyle.tagColor}`}
              >
                {tagStyle.tagText}
              </Text>
            </HStack>

            {/* Title */}
            <Heading size="md" className="font-bold text-typography-800">
              {item.title}
            </Heading>
            <Text
              className="text-sm text-typography-500"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.content}
            </Text>

            <Text className="mt-2 text-xs font-medium text-typography-500">
              {dateText}
            </Text>
          </VStack>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <VStack className="my-4 px-2" space="md">
      <HStack className="items-center justify-between">
        <Heading size="lg" className="font-bold text-gray-900 dark:text-white">
          {t("announcements.title")}
        </Heading>
        <Link href="/announcements" asChild>
          <Text className="text-sm font-semibold text-blue-600 active:opacity-70 dark:text-blue-400">
            {t("announcements.see_all")}
          </Text>
        </Link>
      </HStack>

      {announcements && announcements.length > 0 ? (
        <FlatList
          data={announcements}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            paddingVertical: 8,
          }}
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
