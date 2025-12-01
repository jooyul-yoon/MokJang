import GroupList from "@/components/GroupList";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
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
  Meeting,
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

  const { data: meetings = [], isLoading: isLoadingMeetings } = useQuery({
    queryKey: ["meetings", userGroup?.id],
    queryFn: () => fetchMeetings(userGroup!.id),
    enabled: !!userGroup?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["userGroup"] }),
      queryClient.invalidateQueries({ queryKey: ["groups"] }),
      queryClient.invalidateQueries({ queryKey: ["userJoinRequests"] }),
      queryClient.invalidateQueries({ queryKey: ["meetings"] }),
    ]);
    setRefreshing(false);
  };

  if (isLoadingUserGroup) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView className="flex-1 p-4">
          <VStack className="gap-4">
            <Heading>{t("community.mokjang")}</Heading>
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
          <Heading>
            {userGroup ? userGroup.name : t("community.mokjang")}
          </Heading>
        </VStack>

        {userGroup ? (
          <VStack className="gap-4">
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
            {/* Meetings Section */}
            <VStack className="space-y-4">
              <Heading
                size="sm"
                className="text-lg text-typography-black dark:text-typography-white"
              >
                {t("community.upcomingMeetings")}
              </Heading>
              {meetings.length > 0 ? (
                meetings.map((meeting: Meeting) => (
                  <VStack key={meeting.id}>
                    <Divider />
                    <HStack className="dark:bg-background-card rounded-lg py-2">
                      <VStack className="flex-1">
                        <Text className="font-bold text-typography-black dark:text-typography-white">
                          {meeting.title || t("community.mokjangMeeting")}
                        </Text>
                        <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
                          {new Date(meeting.meeting_time).toLocaleString(
                            "en-US",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </Text>
                      </VStack>
                      {meeting.profiles ? (
                        <VStack>
                          <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
                            👤 {meeting.profiles.full_name}
                          </Text>
                          <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
                            📍 {meeting.location}
                          </Text>
                        </VStack>
                      ) : null}
                    </HStack>
                  </VStack>
                ))
              ) : (
                <Text className="text-typography-gray-500">
                  {t("community.noUpcomingMeetings")}
                </Text>
              )}
            </VStack>
            {/* 목장 기도제목 */}
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
