import AnnouncementCarousel from "@/components/annoucements/AnnouncementCarousel";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements } from "@/services/AnnouncementApi";
import { useGroupStore } from "@/store/groupStore";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, useColorScheme, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { onRefreshHelper } from "@/utils/refreshHelper";

import { Post } from "@/api/feeds/queries";
import {
  CommentsSheet,
  CommentsSheetRef,
} from "@/components/feeds/CommentsSheet";
import { Bell } from "lucide-react-native";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { selectedGroup } = useGroupStore();

  const commentsSheetRef = useRef<CommentsSheetRef>(null);

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/images/logo-dark.png")
      : require("@/assets/images/logo-light.png");

  const handleCommentPress = (post: Post) => {
    commentsSheetRef.current?.present(post.id);
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    onRefreshHelper(setRefreshing, ["announcements"]);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white py-2 dark:bg-background-dark"
      edges={["top"]}
    >
      <VStack className="flex-1 px-4">
        {/* Top Bar */}
        <HStack className="items-center justify-between pb-2">
          <Image
            source={logoSource}
            style={{ width: 144, height: 54 }}
            contentFit="contain"
          />
          <TouchableOpacity className="p-2">
            <Bell
              size={24}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </HStack>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AnnouncementCarousel announcements={announcements} />

          {/* <FeedList
            visibility={"public"}
            groupId={selectedGroup?.id}
            onCommentPress={handleCommentPress}
          /> */}
        </ScrollView>
      </VStack>

      <CommentsSheet ref={commentsSheetRef} />
    </SafeAreaView>
  );
}
