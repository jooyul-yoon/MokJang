import AnnouncementCarousel from "@/components/annoucements/AnnouncementCarousel";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements } from "@/services/AnnouncementApi";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, ["announcements"]);
  }, []);

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/images/logo-dark.png")
      : require("@/assets/images/logo-light.png");

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <VStack className="flex-1">
        <Image
          source={logoSource}
          style={{ width: 144, height: 54, marginLeft: 16 }}
        />

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          className="px-4"
        >
          <AnnouncementCarousel announcements={announcements} />
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
}
