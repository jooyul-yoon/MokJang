import { GoBackHeader } from "@/components/GoBackHeader";
import { PrayerRequestBadges } from "@/components/PrayerRequestBadges";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchUserProfile } from "@/services/api";
import { fetchMyPrayerRequests } from "@/services/PrayerRequestApi";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPrayerRequestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: myPrayers = [], isLoading } = useQuery({
    queryKey: ["myPrayers"],
    queryFn: fetchMyPrayerRequests,
  });

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <GoBackHeader title={t("profile.myPrayers", "My Prayer Requests")} />

      <ScrollView className="flex-1 p-4">
        <VStack className="gap-3 pb-10">
          {isLoading ? (
            <ActivityIndicator className="mt-10" />
          ) : myPrayers.length > 0 ? (
            myPrayers.map((prayer, index) => (
              <TouchableOpacity
                key={prayer.id}
                onPress={() => router.push(`/prayer-requests/${prayer.id}`)}
              >
                <Card className="rounded-xl bg-white p-5 shadow-sm dark:bg-primary-500/10">
                  <HStack className="mb-3 items-center justify-between">
                    <Text className="text-xs font-medium text-typography-500">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </Text>
                    <PrayerRequestBadges request={prayer} />
                  </HStack>
                  <Text
                    numberOfLines={4}
                    className="text-base leading-relaxed text-typography-800"
                  >
                    {prayer.content}
                  </Text>

                  {/* Footer Actions */}
                  <HStack className="mt-4 items-center justify-between">
                    {prayer.prayer_request_amens.length > 0 ? (
                      <HStack className="items-center gap-2">
                        <HStack className="-space-x-1.5">
                          {prayer.prayer_request_amens
                            .slice(0, 3)
                            .map((amen, i) => (
                              <Avatar
                                key={amen.id || i}
                                size="xs"
                                className="z-10 h-6 w-6 border-[2px] border-white"
                              >
                                <AvatarImage
                                  source={{
                                    uri:
                                      amen.profiles?.avatar_url ||
                                      `https://i.pravatar.cc/100?img=${
                                        i + index * 2 + 10
                                      }`,
                                  }}
                                />
                              </Avatar>
                            ))}
                        </HStack>
                        <Text className="ml-1 text-[12px] font-medium text-typography-500">
                          {prayer.prayer_request_amens.length}{" "}
                          {t("prayerBoard.prayed")}
                        </Text>
                      </HStack>
                    ) : (
                      <HStack></HStack>
                    )}
                    <HStack></HStack>
                  </HStack>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <VStack className="mt-20 items-center justify-center">
              <Text className="text-typography-500">
                {t("community.noPrayerRequests", "No prayer requests yet.")}
              </Text>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
