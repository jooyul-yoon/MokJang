import GroupList from "@/components/GroupList";
import MeetingSchedule from "@/components/MeetingSchedule";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
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
  fetchUserProfile,
} from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Plus, Settings } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

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
  }, []);

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
              <VStack className="mb-4 gap-2">
                <HStack className="justify-between">
                  <VStack>
                    <Text className="text-typography-600 dark:text-typography-400">
                      {userGroup.description}
                    </Text>
                    <Heading
                      size="xl"
                      className="text-typography-black dark:text-typography-white"
                    >
                      {userGroup.name}
                    </Heading>
                    <HStack className="mt-2 items-center gap-2">
                      <Text className="text-typography-600 dark:text-typography-400">
                        {userGroup.meeting_time}
                      </Text>
                      <Text className="text-typography-600 dark:text-typography-400">
                        @{userGroup.region}
                      </Text>
                    </HStack>
                  </VStack>
                  {userGroup?.leader_id === userProfile?.id && (
                    <Button
                      size="md"
                      variant="link"
                      action="secondary"
                      onPress={() => router.push("/groups/manage")}
                      className="p-0"
                    >
                      <ButtonIcon
                        as={Settings}
                        className="h-6 w-6 text-typography-900 dark:text-typography-100"
                      />
                    </Button>
                  )}
                </HStack>
              </VStack>
              <MeetingSchedule userGroup={userGroup} meetings={meetings} />
            </VStack>
          ) : (
            <VStack className="flex-1 gap-4">
              <GroupList
                groups={groups}
                initialRequestedGroups={requestedGroupIds}
                isLoading={isLoadingGroups || isLoadingRequests}
              />
            </VStack>
          )}
        </VStack>
      </ScrollView>
      {!userGroup && (
        <Fab
          size="lg"
          placement="bottom right"
          onPress={() => router.push("/groups/create")}
        >
          <FabIcon as={Plus} />
          <FabLabel>{t("community.createMokjang")}</FabLabel>
        </Fab>
      )}
    </SafeAreaView>
  );
}
