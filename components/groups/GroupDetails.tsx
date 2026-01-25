import { leaveGroup, UserProfile } from "@/services/api";
import { Group } from "@/types/typeGroups";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { router } from "expo-router";
import { t } from "i18next";
import { DeleteIcon, Settings } from "lucide-react-native";
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
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

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
    if (myGroups && myGroups.length > 0) {
      setSelectedGroup(myGroups[0]);
    }
  }, [myGroups]);

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
            <HStack>
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

        {/* <Card className="shadow-xs rounded-md border border-gray-100 bg-primary-50 p-2 dark:border-gray-800 dark:bg-gray-800/50">
          <Text className="text-center text-lg font-semibold text-typography-800">
            {selectedGroup?.description}
          </Text>
          <HStack className="mt-2 items-center justify-center gap-2">
            <Badge action="info" className="rounded-full" size="lg">
              <BadgeIcon as={Clock} />
              <BadgeText className="ml-2">
                {selectedGroup?.meeting_time}
              </BadgeText>
            </Badge>
            <Badge action="info" className="rounded-full" size="lg">
              <BadgeIcon as={MapPin} />
              <BadgeText className="ml-2">{selectedGroup?.region}</BadgeText>
            </Badge>
          </HStack>
        </Card> */}
        <GroupSchedules selectedGroup={selectedGroup} />
      </ScrollView>
    </VStack>
  );
}
