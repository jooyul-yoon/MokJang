import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { fetchUserJoinRequests, joinGroup } from "@/services/GroupsApi";
import { Group } from "@/types/typeGroups";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { IconCalendar, IconMapPin } from "@tabler/icons-react-native";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import TabTitle from "../shared/TabTitle";
import { Badge, BadgeText } from "../ui/badge";
import { Button, ButtonText } from "../ui/button";
import { Center } from "../ui/center";
import { HStack } from "../ui/hstack";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { GroupMembersFacepile } from "./GroupMembersFacepile";

const GROUP_EMOJIS = ["🌱", "☀️", "🕊️", "🌊", "🌿", "⭐", "🔥", "🌙"];
const GROUP_BG_COLORS = [
  "#EBF2FF",
  "#FFF5B8",
  "#EEF4FF",
  "#E8F8FF",
  "#E8F5E9",
  "#FFF9E6",
  "#FFEBE8",
  "#F3E8FF",
];

function getGroupStyle(name: string): { emoji: string; bg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  const idx = Math.abs(hash) % GROUP_EMOJIS.length;
  return { emoji: GROUP_EMOJIS[idx], bg: GROUP_BG_COLORS[idx] };
}

interface GroupListProps {
  groups: Group[];
  isLoading?: boolean;
}

export default function GroupList({
  groups,
  isLoading = false,
}: GroupListProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const { data: requestedGroupIds = [] } = useQuery({
    queryKey: ["userJoinRequests"],
    queryFn: fetchUserJoinRequests,
  });

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, [
      "myGroups",
      "groups",
      "userJoinRequests",
      "groupMembers",
    ]);
  }, []);

  const handleJoinRequest = async (groupId: string) => {
    if (requestedGroupIds.includes(groupId)) return;
    const { success, error } = await joinGroup(groupId);
    onRefresh();
    if (!success) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t("common.error")}</ToastTitle>
              <ToastDescription>
                {error || t("community.joinRequestFailed")}
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    } else {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="success" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t("common.success")}</ToastTitle>
              <ToastDescription>
                {t("community.joinRequestSuccess")}
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    }
  };

  return (
    <VStack className="flex-1">
      <TabTitle title={t("community.mokjang")} />
      {isLoading ? (
        <VStack className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </VStack>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerClassName="flex-1 pb-10 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const { emoji, bg } = getGroupStyle(item.name);
            const requested = requestedGroupIds.includes(item.id);
            return (
              <VStack
                className="mx-4 mb-3 rounded-2xl bg-background-0 p-4 shadow-card"
                space="md"
              >
                <HStack space="md" className="items-center">
                  <VStack
                    className="h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: bg }}
                  >
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  </VStack>
                  <VStack className="flex-1">
                    <Text
                      className="text-lg font-semibold text-typography-900"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text
                        className="text-xs font-semibold text-typography-400"
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                  </VStack>
                  <Badge size="lg" className="rounded-full bg-primary-100">
                    <BadgeText className="font-bold text-primary-500">
                      {item.group_members.length}명
                    </BadgeText>
                  </Badge>
                </HStack>

                <HStack space="lg" className="items-center">
                  <HStack space="xs" className="items-center">
                    <Icon
                      as={IconCalendar}
                      size="xs"
                      className="text-typography-400"
                    />
                    <Text className="text-xs text-typography-500">
                      {item.meeting_time}
                    </Text>
                  </HStack>
                  <HStack space="xs" className="items-center">
                    <Icon
                      as={IconMapPin}
                      size="xs"
                      className="text-typography-400"
                    />
                    <Text className="text-xs text-typography-500">
                      {item.region}
                    </Text>
                  </HStack>
                </HStack>

                <HStack className="items-center justify-between border-t border-outline-100 pt-3">
                  <GroupMembersFacepile groupId={item.id} max={4} />
                  <Button
                    size="sm"
                    onPress={() => handleJoinRequest(item.id)}
                    isDisabled={requested}
                    className="rounded-full bg-primary-500"
                  >
                    <ButtonText className="font-semibold text-white">
                      {requested
                        ? t("community.joinRequested")
                        : t("community.joinRequest")}
                    </ButtonText>
                  </Button>
                </HStack>
              </VStack>
            );
          }}
          ListEmptyComponent={
            <Center className="flex-1 py-20">
              <Text className="text-typography-400">
                {t("community.noGroups")}
              </Text>
            </Center>
          }
        />
      )}
    </VStack>
  );
}
