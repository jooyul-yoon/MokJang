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
  Images,
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
  View,
} from "react-native";
import { CreateMeetingModal } from "../meetings/CreateMeetingModal";
import UpcomingMeeting from "../meetings/UpcomingMeeting";
import TabTitle from "../shared/TabTitle";
import { Button, ButtonIcon } from "../ui/button";
import { Center } from "../ui/center";
import { HStack } from "../ui/hstack";
import { Icon } from "../ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "../ui/menu";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { GroupMembersStrip } from "./GroupMembersStrip";
import GroupSchedules from "./GroupSchedules";
import { RecentPrayersStrip } from "./RecentPrayersStrip";

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
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerClassName="gap-4"
          showsVerticalScrollIndicator={false}
        >
          <GroupSchedules
            selectedGroup={myGroups[0]}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onDateChange={createState.setDate}
          />

          <UpcomingMeeting groupId={myGroups[0].id} />

          <GroupMembersStrip
            groupId={myGroups[0].id}
            leaderId={myGroups[0].leader_id}
          />

          <VStack className="mx-4 mt-2 pb-6">
            <Text className="mb-3 px-1 text-base font-bold tracking-[-0.3px] text-typography-900">
              {t("community.groupActivities")}
            </Text>
            <VStack className="overflow-hidden rounded-mj bg-background-0 shadow-card">
              <TouchableOpacity
                activeOpacity={0.5}
                className="h-[58px] w-full flex-row items-center justify-between border-b border-outline-100 px-4"
                onPress={() => router.push(`/groups/${myGroups[0].id}/prayers`)}
              >
                <HStack space="md" className="items-center">
                  <Center className="h-9 w-9 rounded-lg bg-[#FFF0F0]">
                    <Icon as={Heart} size="sm" className="text-[#FF5C5C]" />
                  </Center>
                  <VStack>
                    <Text className="text-[15px] font-semibold tracking-[-0.2px] text-typography-900">
                      {t("community.prayers")}
                    </Text>
                  </VStack>
                </HStack>
                <Icon
                  as={ChevronRight}
                  size="sm"
                  className="text-typography-300"
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                className={`h-[58px] w-full flex-row items-center justify-between px-4 ${
                  myGroups[0]?.leader_id === userProfile?.id
                    ? "border-b border-outline-100"
                    : ""
                }`}
                onPress={() => router.push(`/groups/${myGroups[0].id}/feeds`)}
              >
                <HStack space="md" className="items-center">
                  <Center className="h-9 w-9 rounded-lg bg-primary-100">
                    <Icon as={Images} size="sm" className="text-primary-500" />
                  </Center>
                  <VStack>
                    <Text className="text-[15px] font-semibold tracking-[-0.2px] text-typography-900">
                      {t("community.feeds")}
                    </Text>
                  </VStack>
                </HStack>
                <Icon
                  as={ChevronRight}
                  size="sm"
                  className="text-typography-300"
                />
              </TouchableOpacity>
              {myGroups[0]?.leader_id === userProfile?.id && (
                <TouchableOpacity
                  activeOpacity={0.5}
                  className="h-[58px] w-full flex-row items-center justify-between px-4"
                  onPress={() => router.push(`/groups/${myGroups[0].id}/diary`)}
                >
                  <HStack space="md" className="items-center">
                    <Center className="h-9 w-9 rounded-lg bg-[#F3E8FF]">
                      <Icon
                        as={NotebookPen}
                        size="sm"
                        className="text-[#7B5EA7]"
                      />
                    </Center>
                    <VStack>
                      <Text className="text-[15px] font-semibold tracking-[-0.2px] text-typography-900">
                        {t("community.diary")}
                      </Text>
                    </VStack>
                  </HStack>
                  <Icon
                    as={ChevronRight}
                    size="sm"
                    className="text-typography-300"
                  />
                </TouchableOpacity>
              )}
            </VStack>
          </VStack>

          <RecentPrayersStrip groupId={myGroups[0].id} />
          <View className="h-10" />
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
