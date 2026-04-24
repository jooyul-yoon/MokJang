import AnnouncementCarousel from "@/components/annoucements/AnnouncementCarousel";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements } from "@/services/AnnouncementApi";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CommentsSheet,
  CommentsSheetRef,
} from "@/components/feeds/CommentsSheet";
import TabTitle from "@/components/shared/TabTitle";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const commentsSheetRef = useRef<CommentsSheetRef>(null);

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/images/logo-dark.png")
      : require("@/assets/images/logo-light.png");

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    onRefreshHelper(setRefreshing, ["announcements"]);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white px-6 dark:bg-background-dark"
      edges={["top"]}
    >
      <VStack className="flex-1">
        {/* Top Bar */}
        <TabTitle title={t("announcements.title")} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AnnouncementCarousel announcements={announcements} />
        </ScrollView>
      </VStack>

      <CommentsSheet ref={commentsSheetRef} />
    </SafeAreaView>
  );
}
