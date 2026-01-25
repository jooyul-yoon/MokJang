import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { fetchUserJoinRequests, joinGroup } from "@/services/GroupsApi";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin } from "lucide-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import TabTitle from "../shared/TabTitle";
import { Badge, BadgeIcon, BadgeText } from "../ui/badge";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";

interface Group {
  id: string;
  name: string;
  description: string;
  meeting_time: string;
  region: string;
}

interface GroupListProps {
  groups: Group[];
  myGroups?: Group[] | null;
  isLoading?: boolean;
}

export default function GroupList({
  groups,
  myGroups,
  isLoading = false,
}: GroupListProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const { data: requestedGroupIds = [], isLoading: isLoadingRequests } =
    useQuery({
      queryKey: ["userJoinRequests"],
      queryFn: fetchUserJoinRequests,
      enabled: !myGroups,
    });

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, ["myGroups", "groups", "userJoinRequests"]);
  }, []);

  const handleJoinRequest = async (groupId: string) => {
    if (requestedGroupIds.includes(groupId)) return;

    const { success, error } = await joinGroup(groupId);

    if (!success) {
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="error" variant="solid">
              <VStack space="xs">
                <ToastTitle>{t("common.error")}</ToastTitle>
                <ToastDescription>
                  {error || t("community.joinRequestFailed")}
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } else {
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="success" variant="solid">
              <VStack space="xs">
                <ToastTitle>{t("common.success")}</ToastTitle>
                <ToastDescription>
                  {t("community.joinRequestSuccess")}
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    }
  };

  return (
    <VStack className="flex-1 gap-4">
      <TabTitle title={t("community.exploreMokjangs")} />
      {isLoading ? (
        <VStack className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </VStack>
      ) : (
        <FlatList
          data={groups}
          contentContainerClassName="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <HStack
              key={item.id}
              className="flex-row-reverse items-center justify-between overflow-hidden rounded-lg border-b border-primary-0 px-4 py-6"
              space="md"
            >
              <Button
                onPress={() => handleJoinRequest(item.id)}
                isDisabled={requestedGroupIds.includes(item.id)}
                className="bg-secondary-500"
              >
                <ButtonText className="font-bold text-typography-black">
                  {requestedGroupIds.includes(item.id)
                    ? t("community.requested")
                    : t("community.requestToJoin")}
                </ButtonText>
              </Button>
              <VStack className="flex-1 gap-2">
                <Text
                  className="text-xl font-bold text-typography-900"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-lg text-typography-500" numberOfLines={3}>
                  {item.description}
                </Text>
                <HStack className="mt-2 gap-2">
                  <Badge action="info" className="rounded-full" size="lg">
                    <BadgeIcon as={Clock} />
                    <BadgeText className="ml-2">{item.meeting_time}</BadgeText>
                  </Badge>
                  <Badge action="info" className="rounded-full" size="lg">
                    <BadgeIcon as={MapPin} />
                    <BadgeText className="ml-2">{item.region}</BadgeText>
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          )}
        />
      )}
    </VStack>
  );
}
