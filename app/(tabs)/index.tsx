import AnnouncementList from "@/components/AnnouncementList";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements, fetchUserProfile } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: announcements = [], isLoading: isLoadingAnnouncements } =
    useQuery({
      queryKey: ["announcements"],
      queryFn: fetchAnnouncements,
    });

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const canCreateAnnouncement =
    profile?.role === "leader" ||
    profile?.role === "admin" ||
    profile?.role === "church_leader";

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["announcements"] }),
      queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
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

        {canCreateAnnouncement && (
          <Button
            className="mb-4"
            onPress={() => router.push("/announcements/create")}
          >
            <ButtonText>Create Announcement</ButtonText>
          </Button>
        )}

        <AnnouncementList
          announcements={announcements}
          isLoading={isLoadingAnnouncements}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
