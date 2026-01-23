import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { joinGroup } from "@/services/api";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import TabTitle from "./shared/TabTitle";

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
    onRefreshHelper(setRefreshing, ["user", "userGroups", "groups"]);
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

  if (isLoading) {
    return (
      <VStack className="mt-6 gap-4">
        <Heading
          size="md"
          className="mb-2 text-xl text-typography-black dark:text-typography-white"
        >
          {t("community.exploreMokjangs")}
        </Heading>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
          >
            <SkeletonText _lines={1} className="mb-2 h-6 w-1/2" />
            <SkeletonText _lines={2} className="mb-2 h-4 w-full" />
            <VStack className="mt-2 gap-1">
              <SkeletonText _lines={1} className="h-3 w-1/3" />
              <SkeletonText _lines={1} className="h-3 w-1/3" />
            </VStack>
            <Skeleton className="mt-2 h-8 w-32 rounded" />
          </Card>
        ))}
      </VStack>
    );
  }

  return (
    <VStack className="flex-1 gap-4">
      <TabTitle title={t("community.exploreMokjangs")} />
      <ScrollView
        contentContainerClassName="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groups.map((group) => {
          const isRequested = requestedGroups.has(group.id);
          return (
            <Card
              key={group.id}
              variant="elevated"
              className="flex-row items-center justify-between rounded-lg p-4"
            >
              <VStack className="gap-2">
                <Text className="text-lg font-bold text-typography-black dark:text-typography-white">
                  {group.name}
                </Text>
                <Text className="text-sm text-typography-600 dark:text-typography-400">
                  {group.description}
                </Text>
                <VStack className="mt-2">
                  <Text className="text-xs text-typography-500">
                    🕒 {group.meeting_time}
                  </Text>
                  <Text className="text-xs text-typography-500">
                    📍 {group.region}
                  </Text>
                </VStack>
              </VStack>
              <Button
                onPress={() => handleJoinRequest(group.id)}
                size="sm"
                action="secondary"
                isDisabled={isRequested}
              >
                <ButtonText>
                  {isRequested
                    ? t("community.requested")
                    : t("community.requestToJoin")}
                </ButtonText>
              </Button>
            </Card>
          );
        })}
      </ScrollView>
    </VStack>
  );
}
