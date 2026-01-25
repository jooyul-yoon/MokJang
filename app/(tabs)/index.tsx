import AnnouncementCarousel from "@/components/annoucements/AnnouncementCarousel";
import PrayerRequestList from "@/components/PrayerRequestList";
import TabTitle from "@/components/shared/TabTitle";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements } from "@/services/AnnouncementApi";
import { fetchUserProfile } from "@/services/api";
import { fetchMyGroups } from "@/services/GroupsApi";
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
    queryKey: ["myGroups"],
    queryFn: fetchMyGroups,
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, [
      "userProfile",
      "myGroups",
      "announcements",
    ]);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <VStack className="flex-1">
        <TabTitle title="MokJang" className="text-primary" />

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          className="px-4"
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
