import { useMeetingActions } from "@/hooks/useMeetingActions";
import { leaveGroup, UserProfile } from "@/services/api";
import { useGroupStore } from "@/store/groupStore";
import { Group } from "@/types/typeGroups";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { router } from "expo-router";
import {
  CalendarPlus2,
  DeleteIcon,
  Grid2X2Plus,
  MenuIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { CreateMeetingModal } from "../meetings/CreateMeetingModal";
import TabTitle from "../shared/TabTitle";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Center } from "../ui/center";
import { HStack } from "../ui/hstack";
import { Icon } from "../ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "../ui/menu";
import { VStack } from "../ui/vstack";
import GroupList from "./GroupList";
import GroupSchedules from "./GroupSchedules";

interface GroupDetailsProps {
  userProfile?: UserProfile | null;
  myGroups?: Group[];
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
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  return (
    <VStack className="flex-1">
      <TabTitle
        title={t("community.mokjang", "Community")}
        rightElement={
          selectedGroup?.leader_id === userProfile?.id ? (
            <HStack space="md">
              {viewMode === "schedule" && (
                <Button
                  size="md"
                  variant="link"
                  action="secondary"
                  onPress={() => createState.setShowModal(true)}
                  className="p-2"
                >
                  <ButtonIcon
                    as={CalendarPlus2}
                    className="h-7 w-7 text-typography-700"
                  />
                </Button>
              )}
              {viewMode === "list" && (
                <Button
                  size="md"
                  variant="link"
                  action="secondary"
                  onPress={() => createState.setShowModal(true)}
                  className="p-2"
                >
                  <ButtonIcon
                    as={CalendarPlus2}
                    className="h-7 w-7 text-typography-700"
                  />
                </Button>
              )}
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
      <VStack className="px-4 pb-2">
        <HStack className="justify-between px-2">
          <HStack className="mb-4" space="md">
            {myGroups?.map((group) => (
              <Button
                variant={
                  viewMode === "schedule" && selectedGroup?.id === group.id
                    ? "solid"
                    : "outline"
                }
                key={group.id}
                onPress={() => {
                  setSelectedGroup(group);
                  setViewMode("schedule");
                }}
                className={`rounded-full ${
                  viewMode === "schedule" && selectedGroup?.id === group.id
                    ? "font-bold"
                    : "font-normal"
                }`}
              >
                <ButtonText>{group.name}</ButtonText>
              </Button>
            ))}
          </HStack>
          <Button
            variant={viewMode === "list" ? "solid" : "outline"}
            size="md"
            onPress={() => setViewMode("list")}
            className="rounded-full p-2"
          >
            <ButtonIcon as={Grid2X2Plus} />
          </Button>
        </HStack>
      </VStack>

      <VStack className="flex-1">
        {viewMode === "list" || !selectedGroup ? (
          <GroupList
            myGroups={myGroups}
            groups={groups}
            isLoading={isLoadingGroups}
          />
        ) : (
          <ScrollView
            className="flex-1 px-4"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <GroupSchedules
              selectedGroup={selectedGroup}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onDateChange={createState.setDate}
            />
          </ScrollView>
        )}
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
