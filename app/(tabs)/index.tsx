import AnnouncementCarousel from "@/components/annoucements/AnnouncementCarousel";
import PrayerRequestList from "@/components/PrayerRequestList";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements } from "@/services/AnnouncementApi";
import { fetchUserGroup, fetchUserProfile } from "@/services/api";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: userGroup } = useQuery({
    queryKey: ["userGroup"],
    queryFn: fetchUserGroup,
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, [
      "userProfile",
      "userGroup",
      "announcements",
    ]);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <VStack className="flex-1 px-4">
        <VStack className="mb-4">
          <Heading size="2xl" className="text-primary">
            MokJang
          </Heading>
        </VStack>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AnnouncementCarousel announcements={announcements} />
          <PrayerRequestList
            visibility="public"
            userGroup={userGroup}
            currentUserId={profile?.id}
          />
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
}
