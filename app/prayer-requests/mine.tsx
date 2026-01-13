import { GoBackHeader } from "@/components/GoBackHeader";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchMyPrayerRequests } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPrayerRequestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

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
            myPrayers.map((prayer) => (
              <TouchableOpacity
                key={prayer.id}
                onPress={() => router.push(`/prayer-requests/${prayer.id}`)}
              >
                <Card className="dark:bg-background-card-dark rounded-xl bg-white p-5 shadow-sm">
                  <HStack className="mb-3 items-center justify-between">
                    <Text className="text-xs font-medium text-typography-500">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </Text>
                    <HStack className="items-center gap-2">
                      {prayer.is_answered && (
                        <VStack className="rounded-full bg-success-100 px-2 py-0.5 dark:bg-success-900/30">
                          <Text className="text-[10px] font-bold text-success-700 dark:text-success-400">
                            {t("prayer.answered", "Answered")}
                          </Text>
                        </VStack>
                      )}
                      <VStack className="rounded-full bg-background-100 px-2 py-0.5 dark:bg-background-800">
                        <Text className="text-[10px] font-bold uppercase text-typography-500">
                          {prayer.visibility === "public"
                            ? t("common.public", "Public")
                            : prayer.visibility === "private"
                              ? t("common.private", "Private")
                              : t("common.group", "Group")}
                        </Text>
                      </VStack>
                    </HStack>
                  </HStack>
                  <Text
                    numberOfLines={4}
                    className="text-base leading-relaxed text-typography-800 dark:text-typography-200"
                  >
                    {prayer.content}
                  </Text>
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
