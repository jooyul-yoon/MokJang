import { leaveGroup, UserProfile } from "@/services/api";
import { useGroupStore } from "@/store/groupStore";
import { Group } from "@/types/typeGroups";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { router } from "expo-router";
import { t } from "i18next";
import { CalendarPlus2, DeleteIcon, MenuIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import TabTitle from "../shared/TabTitle";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Center } from "../ui/center";
import { HStack } from "../ui/hstack";
import { Icon } from "../ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "../ui/menu";
import { VStack } from "../ui/vstack";
import GroupSchedules from "./GroupSchedules";

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
  const [refreshing, setRefreshing] = useState(false);
  const { selectedGroup, setSelectedGroup } = useGroupStore();

  const handleRefresh = async () => {
    onRefreshHelper(setRefreshing, ["myGroups", "groups"]);
  };

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
            const { success, error } = await leaveGroup(selectedGroup.id);
            if (success) {
              onRefreshHelper(setRefreshing, ["myGroups", "groups"]);
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

  useEffect(() => {
    if (myGroups && myGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(myGroups[0]);
    }
  }, [myGroups, selectedGroup, setSelectedGroup]);

  if (isLoading || !selectedGroup || !userProfile)
    return (
      <Center className="flex-1">
        <ActivityIndicator />
      </Center>
    );

  return (
    <VStack className="flex-1">
      <TabTitle
        title={t("community.mokjang", "Community")}
        rightElement={
          selectedGroup?.leader_id === userProfile?.id ? (
            <HStack space="md">
              <Button
                size="md"
                variant="link"
                action="secondary"
                onPress={() => router.push("/groups/create")}
                className="p-2"
              >
                <ButtonIcon
                  as={CalendarPlus2}
                  className="h-7 w-7 text-typography-700"
                />
              </Button>
              <Button
                size="md"
                variant="link"
                action="secondary"
                onPress={() => router.push("/groups/manage")}
                className="p-0"
              >
                <ButtonIcon
                  as={MenuIcon}
                  className="h-7 w-7 text-typography-700"
                />
              </Button>
            </HStack>
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
                    as={MenuIcon}
                    className="h-7 w-7 text-typography-700"
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
          )
        }
      />
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <HStack className="mb-4" space="md">
          {myGroups?.map((group) => (
            <Button
              variant={selectedGroup.id === group.id ? "solid" : "outline"}
              key={group.id}
              onPress={() => setSelectedGroup(group)}
              className={`rounded-full ${selectedGroup.id === group.id ? "font-bold" : "font-normal"}`}
            >
              <ButtonText>{group.name}</ButtonText>
            </Button>
          ))}
        </HStack>
        <GroupSchedules selectedGroup={selectedGroup} />
      </ScrollView>
    </VStack>
  );
}
