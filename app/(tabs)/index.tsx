import AnnouncementCarousel from "@/components/annoucements/AnnouncementCarousel";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements } from "@/services/AnnouncementApi";
import { useGroupStore } from "@/store/groupStore";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Post } from "@/api/feeds/queries";
import {
  CommentsSheet,
  CommentsSheetRef,
} from "@/components/feeds/CommentsSheet";
import FeedList from "@/components/feeds/FeedList";
import { Heading } from "@/components/ui/heading";

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

  const renderHeader = () => (
    <VStack className="px-4 pb-2">
      <AnnouncementCarousel announcements={announcements} />

      {/* Feed Tabs */}
      <HStack className="mb-2 mt-6 items-center px-2">
        <Heading size="lg" className="font-bold text-gray-900 dark:text-white">
          {t("feed.tabs.all")}
        </Heading>
      </HStack>
    </VStack>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background-light py-2 dark:bg-background-dark"
      edges={["top"]}
    >
      <VStack className="flex-1">
        {/* Top Bar */}
        <HStack className="items-center justify-between px-4 pb-2">
          <Image
            source={logoSource}
            style={{ width: 144, height: 54 }}
            contentFit="contain"
          />
          <Pressable onPress={() => router.push("/new-post")} className="p-2">
            <IconSymbol
              name="plus.app"
              size={28}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </Pressable>
        </HStack>

        <FeedList
          visibility={"public"}
          groupId={selectedGroup?.id}
          onCommentPress={handleCommentPress}
          ListHeaderComponent={renderHeader()}
        />
      </VStack>

      <CommentsSheet ref={commentsSheetRef} />
    </SafeAreaView>
  );
}
