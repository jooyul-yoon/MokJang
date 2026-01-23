import { GoBackHeader } from "@/components/GoBackHeader";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements } from "@/services/AnnouncementApi";
import { fetchUserProfile } from "@/services/api";
import { Announcement } from "@/types/typeAnnouncement";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, ["announcements"]);
  }, []);

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
      <TouchableOpacity
        activeOpacity={0.8}
        className="pr-12"
        onPress={() => router.push(`/announcements/${item.id}`)}
      >
        <VStack
          space="md"
          className="border-b border-gray-200 p-4 dark:border-gray-800"
        >
          <HStack space="md">
            <Avatar size="sm" className="mt-2">
              <AvatarFallbackText>
                <Text className="text-lg font-semibold text-typography-800 dark:text-white">
                  {item.profiles?.full_name}
                </Text>
              </AvatarFallbackText>
              <AvatarImage source={{ uri: item.profiles?.avatar_url }} />
            </Avatar>
            <VStack className="w-full">
              <Text className={`text-sm font-bold ${tagStyle.tagColor}`}>
                {tagStyle.tagText}
              </Text>
              <Text
                numberOfLines={1}
                className="text-lg font-semibold text-typography-800 dark:text-white"
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={2}
                className="mt-3 text-sm text-typography-500 dark:text-typography-400"
              >
                {item.content}
              </Text>
              <Text className="mt-3 text-xs text-typography-400">
                {dateText}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <GoBackHeader
        title={t("announcements.title")}
        rightElement={
          user?.role === "admin" && (
            <TouchableOpacity
              onPress={() => router.push("/announcements/create")}
              className="p-2"
            >
              <Icon as={Plus} size="md" />
            </TouchableOpacity>
          )
        }
      />
      <FlatList
        data={announcements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !isLoading ? (
            <Box className="flex-1 items-center justify-center p-8">
              <Text className="text-typography-500">
                No announcements found
              </Text>
            </Box>
          ) : (
            <ActivityIndicator />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}
