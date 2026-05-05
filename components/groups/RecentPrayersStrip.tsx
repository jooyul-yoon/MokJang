import { fetchGroupPrayerRequests } from "@/services/PrayerRequestApi";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

interface RecentPrayersStripProps {
  groupId: string;
}

export function RecentPrayersStrip({ groupId }: RecentPrayersStripProps) {
  const { t } = useTranslation();

  const { data: prayers = [], isLoading } = useQuery({
    queryKey: ["groupPrayers", groupId],
    queryFn: () => fetchGroupPrayerRequests(groupId),
  });

  if (isLoading) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  if (prayers.length === 0) {
    return null; // Don't show the section if there are no recent prayers
  }

  return (
    <VStack className="mt-2 pb-6">
      <HStack className="mb-3 items-center justify-between px-4">
        <Text className="text-base font-bold tracking-[-0.3px] text-typography-900">
          {t("community.recentPrayers", "최근 기도제목")}
        </Text>
      </HStack>

      <FlatList
        data={prayers}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 gap-3 pb-1"
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const profile = item.profiles;
          const name = profile?.full_name || "?";
          const initial = name.charAt(0);
          const amensCount = item.prayer_request_amens?.length || 0;

          // Simple dynamic color for avatar background based on initial
          const avatarColors = ["#467CFA", "#FF7043", "#4CAF50", "#9C27B0", "#FFB300"];
          const charCode = initial.charCodeAt(0) || 0;
          const bgColor = avatarColors[charCode % avatarColors.length];

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-[200px] rounded-xl border border-outline-100 bg-background-0 p-3.5 shadow-card"
              onPress={() => router.push(`/groups/${groupId}/prayers`)}
            >
              <HStack className="mb-2 items-center" space="sm">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: bgColor }}
                >
                  <Text className="text-[10px] font-bold text-white">{initial}</Text>
                </View>
                <Text className="text-xs font-semibold text-typography-700">{name}</Text>
                <Text className="ml-auto text-[11px] text-typography-400">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Text>
              </HStack>

              <Text
                className="text-[13px] leading-5 text-typography-700"
                numberOfLines={3}
              >
                {item.content}
              </Text>

              <HStack className="mt-2.5 items-center border-t border-outline-100 pt-2" space="xs">
                <Heart size={14} className="text-typography-400" />
                <Text className="text-xs font-medium text-typography-400">
                  {t("prayer.prayTogether", "함께 기도하기")} · <Text className="font-semibold">{amensCount}</Text>
                </Text>
              </HStack>
            </TouchableOpacity>
          );
        }}
      />
    </VStack>
  );
}
