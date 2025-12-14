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
import { useEffect, useState } from "react";

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
  const toast = useToast();
  const [requestedGroups, setRequestedGroups] = useState<Set<string>>(
    new Set(initialRequestedGroups),
  );

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
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>
                  {error || "Failed to send join request."}
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
                <ToastTitle>Success</ToastTitle>
                <ToastDescription>
                  Join request sent successfully!
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
          className="mb-2 text-typography-black dark:text-typography-white"
        >
          Explore MokJangs
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
    <VStack className="mt-6 gap-4">
      <Heading
        size="md"
        className="mb-2 text-typography-black dark:text-typography-white"
      >
        Explore MokJangs
      </Heading>
      {groups.map((group) => {
        const isRequested = requestedGroups.has(group.id);
        return (
          <Card
            key={group.id}
            className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
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
              <Button
                onPress={() => handleJoinRequest(group.id)}
                size="sm"
                action={isRequested ? "secondary" : "primary"}
                isDisabled={isRequested}
                className="mt-2 self-start"
              >
                <ButtonText>
                  {isRequested ? "Requested" : "Request to Join"}
                </ButtonText>
              </Button>
            </VStack>
          </Card>
        );
      })}
    </VStack>
  );
}
