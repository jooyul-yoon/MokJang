import { Skeleton } from "@/components/ui/skeleton";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { joinGroup } from "@/services/api";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { Clock, MapPin } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl } from "react-native";
import TabTitle from "./shared/TabTitle";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { Button, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

interface Group {
  id: string;
  name: string;
  description: string;
  meeting_time: string;
  region: string;
}

interface GroupListProps {
  groups: Group[];
  initialRequestedGroups?: string[];
  isLoading?: boolean;
}

export default function GroupList({
  groups,
  initialRequestedGroups = [],
  isLoading = false,
}: GroupListProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [requestedGroups, setRequestedGroups] = useState<Set<string>>(
    new Set(initialRequestedGroups),
  );

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, ["groups"]);
  }, []);

  useEffect(() => {
    setRequestedGroups(new Set(initialRequestedGroups));
  }, [initialRequestedGroups]);

  const handleJoinRequest = async (groupId: string) => {
    if (requestedGroups.has(groupId)) return;

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
      setRequestedGroups((prev) => new Set(prev).add(groupId));
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
      {!isLoading ? (
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
                isDisabled={requestedGroups.has(item.id)}
                className="bg-secondary-500"
              >
                <ButtonText className="font-bold text-typography-black">
                  {requestedGroups.has(item.id)
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
      ) : (
        <VStack>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </VStack>
      )}
    </VStack>
  );
}
