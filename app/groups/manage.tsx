import { GoBackHeader } from "@/components/GoBackHeader";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
  approveJoinRequest,
  fetchGroupMembers,
  fetchGroupRequests,
  fetchUserGroup,
  fetchUserProfile,
  rejectJoinRequest,
} from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupManagementScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: userGroup } = useQuery({
    queryKey: ["userGroup"],
    queryFn: fetchUserGroup,
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["groupRequests", userGroup?.id],
    queryFn: () => fetchGroupRequests(userGroup?.id || ""),
    enabled: !!userGroup?.id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["groupMembers", userGroup?.id],
    queryFn: () => fetchGroupMembers(userGroup?.id || ""),
    enabled: !!userGroup?.id,
  });

  const handleApprove = async (requestId: string, userId: string) => {
    if (!userGroup) return;

    const { success, error } = await approveJoinRequest(
      requestId,
      userGroup.id,
      userId,
    );

    if (success) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="success" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t("common.success")}</ToastTitle>
              <ToastDescription>
                Request approved successfully.
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ["groupRequests"] });
    } else {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t("common.error")}</ToastTitle>
              <ToastDescription>
                {error || "Failed to approve request."}
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    }
  };

  const handleReject = async (requestId: string) => {
    const { success, error } = await rejectJoinRequest(requestId);

    if (success) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="success" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t("common.success")}</ToastTitle>
              <ToastDescription>
                Request rejected successfully.
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ["groupRequests"] });
    } else {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t("common.error")}</ToastTitle>
              <ToastDescription>
                {error || "Failed to reject request."}
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    }
  };

  if (userGroup && userProfile && userGroup.leader_id !== userProfile.id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <Text className="text-typography-black dark:text-typography-white">
          Unauthorized
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView contentContainerClassName="p-4">
        <VStack className="gap-6">
          <GoBackHeader title={t("community.manageGroup")} />

          <VStack className="gap-4">
            <Heading
              size="md"
              className="text-typography-black dark:text-typography-white"
            >
              {t("community.pendingRequests")}
            </Heading>

            {isLoading ? (
              <Text>Loading...</Text>
            ) : requests.length === 0 ? (
              <Text className="text-typography-500">
                {t("community.noPendingRequests")}
              </Text>
            ) : (
              requests.map((request) => (
                <Card
                  key={request.id}
                  className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
                >
                  <HStack className="items-center justify-between">
                    <HStack space="md" className="items-center">
                      <Avatar>
                        <AvatarFallbackText>
                          {request.profiles.full_name}
                        </AvatarFallbackText>
                        <AvatarImage
                          source={{ uri: request.profiles.avatar_url }}
                        />
                      </Avatar>
                      <Text className="font-bold text-typography-black dark:text-typography-white">
                        {request.profiles.full_name}
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack className="mt-4 justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      action="negative"
                      onPress={() => handleReject(request.id)}
                    >
                      <ButtonText>{t("community.reject")}</ButtonText>
                    </Button>
                    <Button
                      size="sm"
                      action="primary"
                      onPress={() => handleApprove(request.id, request.user_id)}
                    >
                      <ButtonText>{t("community.approve")}</ButtonText>
                    </Button>
                  </HStack>
                </Card>
              ))
            )}

            <Heading
              size="md"
              className="mt-6 text-typography-black dark:text-typography-white"
            >
              {t("community.members")}
            </Heading>

            {members.map((member, index) => (
              <React.Fragment key={member.user_id}>
                <HStack space="md" className="items-center py-2">
                  <Avatar>
                    <AvatarFallbackText>
                      {member.profiles.full_name}
                    </AvatarFallbackText>
                    <AvatarImage source={{ uri: member.profiles.avatar_url }} />
                  </Avatar>
                  <Text className="font-bold text-typography-black dark:text-typography-white">
                    {member.profiles.full_name}
                  </Text>
                </HStack>
                {index < members.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
