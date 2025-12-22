import AnnouncementList from "@/components/AnnouncementList";
import { HomeTabs } from "@/components/HomeTabs";
import PrayerRequestList from "@/components/PrayerRequestList";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchUserGroup, fetchUserProfile } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const tabs = [
  { en: "Announcements", ko: "공지사항", value: "announcements" },
  { en: "Prayers", ko: "기도제목", value: "prayers" },
  { en: "QT", ko: "말씀 묵상", value: "qt" },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: userGroup } = useQuery({
    queryKey: ["userGroup"],
    queryFn: fetchUserGroup,
  });

  const canCreateAnnouncement =
    profile?.role === "leader" ||
    profile?.role === "admin" ||
    profile?.role === "church_leader";

  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <VStack className="flex-1">
        <VStack className="mb-4 px-4">
          <Text className="text-2xl font-bold text-typography-black dark:text-typography-white">
            VCHUNG
          </Text>
        </VStack>

        <HomeTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {activeTab.value === "announcements" && <AnnouncementList />}
        {activeTab.value === "prayers" && <PrayerRequestList />}
      </VStack>

      {canCreateAnnouncement && activeTab.value === "announcements" && (
        <Fab
          size="lg"
          placement="bottom right"
          isHovered={false}
          isDisabled={!canCreateAnnouncement}
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
