import AnnouncementList from "@/components/AnnouncementList";
import { HomeTabs } from "@/components/HomeTabs";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements, fetchUserProfile } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const tabs = [
  { en: "Announcements", ko: "공지사항", value: "announcements" },
  { en: "Prayers", ko: "기도제목", value: "prayers" },
  { en: "QT", ko: "말씀 묵상", value: "qt" },
];

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

  const [activeTab, setActiveTab] = useState(tabs[0]);

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
            VCHUNG
          </Text>
        </VStack>

        <HomeTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {activeTab.value === "announcements" && (
          <AnnouncementList
            announcements={announcements}
            isLoading={isLoadingAnnouncements}
          />
        )}
      </ScrollView>

      {canCreateAnnouncement && activeTab.value === "announcements" && (
        <Fab
          size="lg"
          placement="bottom right"
          isHovered={false}
          isDisabled={false}
          isPressed={false}
          onPress={() => router.push("/announcements/create")}
        >
          <FabIcon as={Plus} />
          <FabLabel>{t("announcements.create")}</FabLabel>
        </Fab>
      )}
    </SafeAreaView>
  );
}
