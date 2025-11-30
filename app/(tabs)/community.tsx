import GroupList from "@/components/GroupList";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  fetchGroups,
  fetchUserGroup,
  fetchUserJoinRequests,
} from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: userGroup, isLoading: isLoadingUserGroup } = useQuery({
    queryKey: ["userGroup"],
    queryFn: fetchUserGroup,
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    enabled: !userGroup, // Only fetch if user is not in a group
  });

  const { data: requestedGroupIds = [], isLoading: isLoadingRequests } =
    useQuery({
      queryKey: ["userJoinRequests"],
      queryFn: fetchUserJoinRequests,
      enabled: !userGroup,
    });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["userGroup"] }),
      queryClient.invalidateQueries({ queryKey: ["groups"] }),
      queryClient.invalidateQueries({ queryKey: ["userJoinRequests"] }),
    ]);
    setRefreshing(false);
  };

  if (isLoadingUserGroup) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView className="flex-1 p-4">
          <VStack className="gap-4">
            <SkeletonText _lines={1} className="mb-4 h-8 w-1/2" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            {t("tabs.community")}
          </Text>
        </VStack>

        {userGroup ? (
          <VStack className="gap-4">
            <Card className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm">
              <Heading
                size="md"
                className="mb-2 text-typography-black dark:text-typography-white"
              >
                {t("community.myMokjang")}: {userGroup.name}
              </Heading>
              <Text className="text-typography-gray-600 dark:text-typography-gray-400">
                {userGroup.description}
              </Text>
              <VStack className="mt-4 gap-2">
                <Text className="text-typography-gray-500 text-sm">
                  🕒 {t("community.meetingTime")}: {userGroup.meeting_time}
                </Text>
                <Text className="text-typography-gray-500 text-sm">
                  📍 {t("community.region")}: {userGroup.region}
                </Text>
              </VStack>
            </Card>
            {/* Add more group features here later */}
          </VStack>
        ) : (
          <VStack className="flex-1 gap-4">
            <Button
              onPress={() => router.push("/groups/create")}
              className="mb-4"
            >
              <ButtonText>{t("community.createMokjang")}</ButtonText>
            </Button>
            <GroupList
              groups={groups}
              initialRequestedGroups={requestedGroupIds}
              isLoading={isLoadingGroups || isLoadingRequests}
            />
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
