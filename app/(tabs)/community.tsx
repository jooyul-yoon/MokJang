import GroupList from "@/components/GroupList";
import MeetingSchedule from "@/components/MeetingSchedule";
import PrayerRequestList from "@/components/PrayerRequestList";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  fetchGroups,
  fetchUpcomingMeetings,
  fetchUserGroup,
  fetchUserJoinRequests,
  fetchUserProfile,
  leaveGroup,
} from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { DeleteIcon, Settings } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"meetings" | "prayers">(
    "meetings",
  );

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
    queryFn: () => fetchUpcomingMeetings(userGroup?.id || ""),
    enabled: !!userGroup?.id,
  });

  const onRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["userGroup"] });
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    queryClient.invalidateQueries({ queryKey: ["userJoinRequests"] });
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
  }, []);

  const handleLeaveGroup = async () => {
    if (!userGroup?.id) return;

    Alert.alert(
      t("community.leaveGroupTitle", "Leave Group"),
      t(
        "community.leaveGroupMessage",
        "Are you sure you want to leave this group?",
      ),
      [
        {
          text: t("common.cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("common.leave", "Leave"),
          style: "destructive",
          onPress: async () => {
            const { success, error } = await leaveGroup(userGroup.id);
            if (success) {
              queryClient.invalidateQueries({ queryKey: ["userGroup"] });
              queryClient.invalidateQueries({ queryKey: ["groups"] });
              // Optimistically update or just let invalidate handle it
            } else {
              Alert.alert(
                t("common.error", "Error"),
                error ||
                  t("community.leaveGroupError", "Failed to leave group"),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {userGroup ? (
        <VStack className="flex-1 gap-4">
          <VStack className="gap-2 p-4">
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
              {userGroup?.leader_id === userProfile?.id ? (
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
              ) : (
                <Menu
                  trigger={({ ...trigerProps }) => (
                    <Button
                      size="md"
                      variant="link"
                      action="secondary"
                      className="p-0"
                      {...trigerProps}
                    >
                      <ButtonIcon
                        as={Settings}
                        className="h-6 w-6 text-typography-900 dark:text-typography-100"
                      />
                    </Button>
                  )}
                >
                  <MenuItem
                    key="Leave group"
                    textValue="Leave group"
                    onPress={handleLeaveGroup}
                  >
                    <Icon
                      as={DeleteIcon}
                      size="sm"
                      className="mr-2 text-error-500"
                    />
                    <MenuItemLabel size="sm" className="text-error-500">
                      Leave group
                    </MenuItemLabel>
                  </MenuItem>
                </Menu>
              )}
            </HStack>
          </VStack>

          <VStack className="flex-1">
            <HStack className="mb-4 border-b border-outline-100 px-4 dark:border-outline-800">
              <Pressable
                className={`flex-1 border-b-2 py-3 ${activeTab === "meetings" ? "border-primary-500" : "border-transparent"}`}
                onPress={() => setActiveTab("meetings")}
              >
                <Text
                  className={`text-center font-bold ${activeTab === "meetings" ? "text-primary-500" : "text-typography-500"}`}
                >
                  {t("community.meetings", "Meetings")}
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 border-b-2 py-3 ${activeTab === "prayers" ? "border-primary-500" : "border-transparent"}`}
                onPress={() => setActiveTab("prayers")}
              >
                <Text
                  className={`text-center font-bold ${activeTab === "prayers" ? "text-primary-500" : "text-typography-500"}`}
                >
                  {t("community.prayerRequests", "Prayer Requests")}
                </Text>
              </Pressable>
            </HStack>

            {activeTab === "meetings" ? (
              <MeetingSchedule userGroup={userGroup} meetings={meetings} />
            ) : (
              <PrayerRequestList
                visibility="group"
                userGroup={userGroup}
                currentUserId={userProfile?.id}
              />
            )}
          </VStack>
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
      {/* {!userGroup && (
        <Fab
          size="lg"
          placement="bottom right"
          onPress={() => router.push("/groups/create")}
        >
          <FabIcon as={Plus} />
          <FabLabel>{t("community.createMokjang")}</FabLabel>
        </Fab>
      )} */}
    </SafeAreaView>
  );
}
