import GroupList from "@/components/GroupList";
import MeetingSchedule from "@/components/MeetingSchedule";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  fetchGroups,
  fetchMeetings,
  fetchUserGroup,
  fetchUserJoinRequests,
} from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userGroup, isLoading: isGroupLoading } = useQuery({
    queryKey: ["userGroup"],
    queryFn: () => fetchUserGroup(),
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    enabled: !userGroup,
  });

  const { data: requestedGroupIds = [], isLoading: isLoadingRequests } =
    useQuery({
      queryKey: ["userJoinRequests"],
      queryFn: fetchUserJoinRequests,
      enabled: !userGroup,
    });

  const {
    data: meetings = [],
    isLoading: isMeetingsLoading,
    refetch,
  } = useQuery({
    queryKey: ["meetings", userGroup?.id],
    queryFn: () => fetchMeetings(userGroup?.id || ""),
    enabled: !!userGroup?.id,
  });

  const onRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["userGroup"] });
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    queryClient.invalidateQueries({ queryKey: ["userJoinRequests"] });
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
  }, [queryClient]);

  if (
    isGroupLoading ||
    isMeetingsLoading ||
    isLoadingGroups ||
    isLoadingRequests
  ) {
    return (
      <SafeAreaView className="flex-1 bg-background-light p-4 dark:bg-background-dark">
        <Heading size="xl">{t("community.mokjang")}</Heading>
        <VStack className="mt-4 gap-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        contentContainerClassName="p-4 pb-20"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <VStack className="gap-6">
          {userGroup ? (
            <VStack className="gap-4">
              <VStack className="gap-2">
                <Heading
                  size="xl"
                  className="text-typography-black dark:text-typography-white"
                >
                  {userGroup.name}
                </Heading>
                <Text className="text-typography-gray-600 dark:text-typography-gray-400">
                  {userGroup.description}
                </Text>
              </VStack>

              <VStack className="gap-2 rounded-lg bg-background-50 p-4 dark:bg-background-900">
                <HStack className="items-center justify-between">
                  <Text className="text-typography-gray-900 dark:text-typography-gray-100 font-semibold">
                    {t("community.meetingTime")}
                  </Text>
                  <Text className="text-typography-gray-600 dark:text-typography-gray-400">
                    {userGroup.meeting_time}
                  </Text>
                </HStack>
                <HStack className="items-center justify-between">
                  <Text className="text-typography-gray-900 dark:text-typography-gray-100 font-semibold">
                    {t("community.region")}
                  </Text>
                  <Text className="text-typography-gray-600 dark:text-typography-gray-400">
                    {userGroup.region}
                  </Text>
                </HStack>
              </VStack>

              <MeetingSchedule userGroup={userGroup} meetings={meetings} />
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
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
