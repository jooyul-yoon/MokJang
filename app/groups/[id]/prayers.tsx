import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Center } from "@/components/ui/center";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchUserProfile } from "@/services/api";
import { fetchPrayerRequests } from "@/services/PrayerRequestApi";
import {
  PrayerRequest,
  prayerRequestCategories,
} from "@/types/typePrayerRequest";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Heart, Plus } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrayerBoardScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams();
  const { t } = useTranslation();

  const [activeFilter, setActiveFilter] = useState("allRequests");
  const filters = ["allRequests", "myPrayers", "answered"];

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["prayerRequests"],
    queryFn: fetchPrayerRequests,
  });

  const filteredRequests = useMemo(() => {
    let groupRequests = requests.filter(
      (r: PrayerRequest) => r.group_id === groupId && r.visibility === "group",
    );

    switch (activeFilter) {
      case "allRequests":
        return groupRequests;
      case "myPrayers":
        return groupRequests.filter(
          (r: PrayerRequest) => r.user_id === userProfile?.id,
        );
      case "answered":
        return groupRequests.filter((r: PrayerRequest) => r.is_answered);
      default:
        return groupRequests;
    }
  }, [requests, groupId, activeFilter, userProfile]);

  const timeAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffHours = Math.floor((now - time) / (1000 * 60 * 60));
    if (diffHours < 1) return t("prayerBoard.justNow");
    if (diffHours < 24) return t("prayerBoard.hoursAgo", { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return t("prayerBoard.yesterday");
    return t("prayerBoard.daysAgo", { count: diffDays });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-background-dark"
      edges={["top"]}
    >
      {/* Custom Header */}
      <HStack className="items-center justify-between px-5 pb-2 pt-4">
        <HStack className="flex-1 items-start gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="-ml-2 mt-1 p-1"
          >
            <Icon as={ArrowLeft} size="xl" className="text-typography-900" />
          </TouchableOpacity>
          <VStack>
            <Text className="mb-0.5 text-[14px] font-bold uppercase tracking-widest text-primary-600">
              {t("prayerBoard.mokjangCommunity")}
            </Text>
            <Heading size="xl" className="font-bold text-typography-900">
              {t("prayerBoard.title")}
            </Heading>
          </VStack>
        </HStack>
      </HStack>

      {/* Filter Chips */}
      <VStack className="border-b border-outline-100 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5"
          contentContainerStyle={{ gap: 8, paddingRight: 40 }}
        >
          {filters.map((f) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.8}
                className={`rounded-full border px-4 py-2 ${
                  isActive
                    ? "border-primary-600 bg-primary-600"
                    : "border-outline-200 bg-white"
                }`}
              >
                <Text
                  className={`text-[13px] font-medium ${
                    isActive ? "text-white" : "text-typography-600"
                  }`}
                >
                  {t(`prayerBoard.${f}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </VStack>

      {/* Cards List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
      >
        {isLoading ? (
          <Center className="py-10">
            <ActivityIndicator size="large" />
          </Center>
        ) : filteredRequests.length === 0 ? (
          <Center className="py-10">
            <Text className="text-typography-500">
              {t("prayerBoard.noPrayerRequests")}
            </Text>
          </Center>
        ) : (
          filteredRequests.map((request: PrayerRequest, index: number) => {
            const categoryId =
              typeof request.category === "string"
                ? request.category
                : request.category?.id;
            const categoryObj =
              prayerRequestCategories[categoryId || "general"] ||
              prayerRequestCategories.general;

            // Mock prayed users layout as per UI image
            const dummyPrays = (index % 3) * 5 + 3; // 3, 8, 13 prayed...

            return (
              <TouchableOpacity
                key={request.id}
                onPress={() => router.push(`/prayer-requests/${request.id}`)}
                className="border-b border-outline-100 p-5"
              >
                {/* User Info & Badge */}
                <HStack className="mb-4 items-start justify-between">
                  <HStack className="flex-1 items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage
                        source={{
                          uri:
                            request.profiles?.avatar_url ||
                            "https://i.pravatar.cc/150?img=" + (index + 4),
                        }}
                      />
                      <AvatarFallbackText>
                        {request.profiles?.full_name}
                      </AvatarFallbackText>
                    </Avatar>
                    <VStack>
                      <Text className="text-[15px] font-bold text-typography-900">
                        {request.profiles?.full_name}
                      </Text>
                      <Text className="text-[12px] text-typography-400">
                        {timeAgo(request.created_at)}
                      </Text>
                    </VStack>
                  </HStack>
                  {categoryObj && (
                    <VStack
                      style={{ backgroundColor: categoryObj.color + "1A" }}
                      className="items-center justify-center rounded-full px-2.5 py-1"
                    >
                      <Text
                        style={{ color: categoryObj.color }}
                        className="text-[10px] font-bold uppercase"
                      >
                        {categoryObj.en}
                      </Text>
                    </VStack>
                  )}
                </HStack>

                {/* Content */}
                <Text className="mb-5 text-[15px] leading-[24px] text-typography-800">
                  {request.content}
                </Text>

                {/* Footer Actions */}
                <HStack className="items-center justify-between">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="flex-row items-center justify-center rounded-xl bg-primary-50 px-4 py-2"
                  >
                    <Icon
                      as={Heart}
                      size="sm"
                      className="mr-2 text-primary-600"
                    />
                    <Text className="text-[13px] font-bold text-primary-600">
                      {t("prayerBoard.amen")}
                    </Text>
                  </TouchableOpacity>

                  <HStack className="items-center gap-2">
                    <HStack className="-space-x-1.5">
                      {[1, 2, 3].map((i) => (
                        <Avatar
                          key={i}
                          size="xs"
                          className="z-10 h-6 w-6 border-[2px] border-white"
                        >
                          <AvatarImage
                            source={{
                              uri: `https://i.pravatar.cc/100?img=${
                                i + index * 2 + 10
                              }`,
                            }}
                          />
                        </Avatar>
                      ))}
                    </HStack>
                    <Text className="ml-1 text-[12px] font-medium text-typography-500">
                      {dummyPrays} {t("prayerBoard.prayed")}
                    </Text>
                  </HStack>
                </HStack>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Write Action Button */}
      <Fab
        size="lg"
        placement="bottom right"
        className="mb-4 mr-2 bg-primary-600 shadow-md hover:bg-primary-700 active:bg-primary-800"
        onPress={() => router.push("/prayer-requests/create")}
      >
        <FabIcon as={Plus} className="text-white" />
      </Fab>
    </SafeAreaView>
  );
}
