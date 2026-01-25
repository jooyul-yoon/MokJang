import { Text } from "@/components/ui/text";
import { leaveGroup, UserProfile } from "@/services/api";
import { Group } from "@/types/typeGroups";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { t } from "i18next";
import { DeleteIcon, Settings } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable } from "react-native";
import TabTitle from "../shared/TabTitle";
import { Button, ButtonIcon } from "../ui/button";
import { Center } from "../ui/center";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Icon } from "../ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "../ui/menu";
import { VStack } from "../ui/vstack";

interface GroupDetailsProps {
  userProfile?: UserProfile | null;
  myGroups?: Group[];
  isLoading?: boolean;
}

export default function GroupDetails({
  myGroups,
  userProfile,
  isLoading,
}: GroupDetailsProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"meetings" | "prayers">(
    "meetings",
  );
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    myGroups && setSelectedGroup(myGroups?.[0]);
  }, [myGroups]);

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    if (!selectedGroup?.id) return;

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
            const { success, error } = await leaveGroup(myGroups![0].id);
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

  console.log(selectedGroup);

  if (isLoading || !selectedGroup || !userProfile)
    return (
      <Center className="flex-1">
        <ActivityIndicator />
      </Center>
    );

  return (
    <VStack className="flex-1 gap-4">
      <TabTitle title={selectedGroup!.name} />
      <VStack className="gap-2 p-4">
        <HStack className="justify-between">
          <VStack>
            <Text className="text-typography-600 dark:text-typography-400">
              {selectedGroup?.description}
            </Text>
            <Heading
              size="xl"
              className="text-typography-black dark:text-typography-white"
            >
              {selectedGroup?.name}
            </Heading>
            <HStack className="mt-2 items-center gap-2">
              <Text className="text-typography-600 dark:text-typography-400">
                {selectedGroup?.meeting_time}
              </Text>
              <Text className="text-typography-600 dark:text-typography-400">
                @{selectedGroup?.region}
              </Text>
            </HStack>
          </VStack>
          {selectedGroup?.leader_id === userProfile?.id ? (
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

        {/* {activeTab === "meetings" ? (
          <MeetingSchedule userGroup={selectedGroup} meetings={meetings} />
        ) : (
          <PrayerRequestList
            visibility="group"
            userGroup={selectedGroup}
            currentUserId={userProfile?.id}
          />
        )} */}
      </VStack>
    </VStack>
  );
}
