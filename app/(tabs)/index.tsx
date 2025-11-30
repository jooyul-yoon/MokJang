import AnnouncementList from "@/components/AnnouncementList";
import GroupList from "@/components/GroupList";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements, fetchGroups } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["announcements"] }),
      queryClient.invalidateQueries({ queryKey: ["groups"] }),
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack className="mb-6">
          <Text className="text-2xl font-bold text-typography-black dark:text-typography-white">
            {t("tabs.home")}
          </Text>
          <Text className="text-typography-gray-500 dark:text-typography-gray-400 text-sm">
            Welcome to MokJang Community
          </Text>
        </VStack>

        <AnnouncementList announcements={announcements} />
        <GroupList groups={groups} />
      </ScrollView>
    </SafeAreaView>
  );
}
