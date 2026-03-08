import { useMeetingActions } from "@/hooks/useMeetingActions";
import { leaveGroup, UserProfile } from "@/services/api";
import { useGroupStore } from "@/store/groupStore";
import { Group } from "@/types/typeGroups";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { router } from "expo-router";
import {
  CalendarPlus2,
  ChevronRight,
  DeleteIcon,
  Heart,
  MenuIcon,
  NotebookPen,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { CreateMeetingModal } from "../meetings/CreateMeetingModal";
import TabTitle from "../shared/TabTitle";
import { Button, ButtonIcon } from "../ui/button";
import { Center } from "../ui/center";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Icon } from "../ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "../ui/menu";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import GroupSchedules from "./GroupSchedules";

interface GroupDetailsProps {
  userProfile?: UserProfile | null;
  myGroups: Group[];
  isLoadingMyGroups?: boolean;
  groups: Group[];
  isLoadingGroups?: boolean;
}

export default function GroupDetails({
  myGroups,
  groups,
  isLoadingGroups,
  userProfile,
  isLoadingMyGroups,
}: GroupDetailsProps) {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const [viewMode, setViewMode] = useState<"schedule" | "list">("schedule");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
  );

  const { createState, actions, status } = useMeetingActions(
    selectedGroup,
    t,
    selectedDate,
  );

  const handleRefresh = async () => {
    onRefreshHelper(setRefreshing, [
      "myGroups",
      "groups",
      "meetings",
      "prayerRequests",
    ]);
  };

  useEffect(() => {
    if (myGroups && myGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(myGroups[0]);
    } else if (myGroups && myGroups.length === 0 && viewMode === "schedule") {
      setViewMode("list");
    }
  }, [myGroups, selectedGroup, setSelectedGroup, viewMode]);

  if (isLoadingMyGroups || !userProfile)
    return (
      <Center className="flex-1">
        <ActivityIndicator />
      </Center>
    );

  const handleLeaveGroup = async () => {
    if (!myGroups) return;
    if (!myGroups[0]?.id) return;

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
            const { success, error } = await leaveGroup(myGroups[0].id);
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

  return (
    <VStack className="flex-1">
      <TabTitle
        title={myGroups[0].name}
        rightElement={
          myGroups[0]?.leader_id === userProfile?.id ? (
            <HStack space="md">
              <Button
                size="md"
                variant="link"
                action="secondary"
                className="p-2"
                onPress={() => createState.setShowModal(true)}
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
      <VStack className="flex-1">
        <ScrollView
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerClassName="gap-4"
        >
          <GroupSchedules
            selectedGroup={myGroups[0]}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onDateChange={createState.setDate}
          />
          <VStack className="mt-4 pb-10">
            <Heading className="mb-2 px-1 text-typography-800">
              {t("community.groupActivities")}
            </Heading>
            <VStack className="overflow-hidden rounded-xl">
              <TouchableOpacity
                activeOpacity={0.5}
                className="h-14 w-full flex-row items-center justify-between px-2"
                onPress={() => router.push(`/groups/${myGroups[0].id}/prayers`)}
              >
                <HStack space="md" className="items-center">
                  <Icon as={Heart} size="md" className="text-typography-500" />
                  <Text className="text-lg font-medium text-typography-800">
                    {t("community.prayers")}
                  </Text>
                </HStack>
                <Icon as={ChevronRight} className="text-typography-400" />
              </TouchableOpacity>
              {/* <TouchableOpacity
                activeOpacity={0.5}
                className="h-14 w-full flex-row items-center justify-between px-2"
                onPress={() => router.push(`/groups/${myGroups[0].id}/feeds`)}
              >
                <HStack space="md" className="items-center">
                  <Icon as={Images} size="md" className="text-typography-500" />
                  <Text className="text-lg font-medium text-typography-800">
                    {t("community.feeds")}
                  </Text>
                </HStack>
                <Icon as={ChevronRight} className="text-typography-400" />
              </TouchableOpacity> */}
              {myGroups[0]?.leader_id === userProfile?.id && (
                <TouchableOpacity
                  activeOpacity={0.5}
                  className="h-14 w-full flex-row items-center justify-between px-2"
                  onPress={() => router.push(`/groups/${myGroups[0].id}/diary`)}
                >
                  <HStack space="md" className="items-center">
                    <Icon
                      as={NotebookPen}
                      size="md"
                      className="text-typography-500"
                    />
                    <Text className="text-lg font-medium text-typography-800">
                      {t("community.diary")}
                    </Text>
                  </HStack>
                  <Icon as={ChevronRight} className="text-typography-400" />
                </TouchableOpacity>
              )}
            </VStack>
          </VStack>
        </ScrollView>
      </VStack>
      <CreateMeetingModal
        isOpen={createState.showModal}
        onClose={() => createState.setShowModal(false)}
        formState={createState}
        onSubmit={actions.createMeeting}
        isSaving={status.isCreating}
        t={t}
      />
    </VStack>
  );
}
