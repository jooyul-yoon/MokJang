import GroupList from "@/components/GroupList";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  fetchGroups,
  fetchMeetings,
  fetchUserGroup,
  fetchUserJoinRequests,
  Meeting,
  volunteerForMeeting,
} from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  const { data: userGroup, isLoading: isGroupLoading } = useQuery({
    queryKey: ["userGroup"],
    queryFn: () => fetchUserGroup(),
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    enabled: !userGroup,
  });

  const { data: requestedGroupIds = [], isLoading: isLoadingRequests } =
    useQuery({
      queryKey: ["userJoinRequests"],
      queryFn: fetchUserJoinRequests,
      enabled: !userGroup,
    });

  const {
    data: meetings = [],
    isLoading: isMeetingsLoading,
    refetch,
  } = useQuery({
    queryKey: ["meetings", userGroup?.id],
    queryFn: () => fetchMeetings(userGroup?.id || ""),
    enabled: !!userGroup?.id,
  });

  const volunteerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMeeting) return;
      await volunteerForMeeting(selectedMeeting, locationInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setShowVolunteerModal(false);
      setLocationInput("");
      setSelectedMeeting(null);
    },
    onError: (error) => {
      console.error("Volunteer failed:", error);
    },
  });

  const handleVolunteerClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setLocationInput(meeting.location || userGroup?.region || "");
    setShowVolunteerModal(true);
  };

  const onRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["userGroup"] });
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    queryClient.invalidateQueries({ queryKey: ["userJoinRequests"] });
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
  }, [queryClient]);

  if (
    isGroupLoading ||
    isMeetingsLoading ||
    isLoadingGroups ||
    isLoadingRequests
  ) {
    return (
      <SafeAreaView className="flex-1 bg-background-light p-4 dark:bg-background-dark">
        <Heading size="xl">{t("community.mokjang")}</Heading>
        <VStack className="mt-4 gap-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        contentContainerClassName="p-4 pb-20"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <VStack className="gap-6">
          {userGroup ? (
            <VStack className="gap-4">
              <VStack className="gap-2">
                <Heading
                  size="xl"
                  className="text-typography-black dark:text-typography-white"
                >
                  {userGroup.name}
                </Heading>
                <Text className="text-typography-gray-600 dark:text-typography-gray-400">
                  {userGroup.description}
                </Text>
              </VStack>

              <VStack className="gap-2 rounded-lg bg-background-50 p-4 dark:bg-background-900">
                <HStack className="items-center justify-between">
                  <Text className="text-typography-gray-900 dark:text-typography-gray-100 font-semibold">
                    {t("community.meetingTime")}
                  </Text>
                  <Text className="text-typography-gray-600 dark:text-typography-gray-400">
                    {userGroup.meeting_time}
                  </Text>
                </HStack>
                <HStack className="items-center justify-between">
                  <Text className="text-typography-gray-900 dark:text-typography-gray-100 font-semibold">
                    {t("community.region")}
                  </Text>
                  <Text className="text-typography-gray-600 dark:text-typography-gray-400">
                    {userGroup.region}
                  </Text>
                </HStack>
              </VStack>

              <VStack className="gap-4">
                <Heading
                  size="sm"
                  className="text-lg text-typography-black dark:text-typography-white"
                >
                  {t("community.upcomingMeetings")}
                </Heading>
                {meetings.length > 0 ? (
                  meetings.map((meeting: Meeting) => (
                    <VStack key={meeting.id}>
                      <Divider />
                      <HStack className="dark:bg-background-card items-center justify-between rounded-lg py-2">
                        <VStack className="flex-1">
                          <Text className="font-bold text-typography-black dark:text-typography-white">
                            {meeting.title || t("community.mokjangMeeting")}
                          </Text>
                          <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
                            {new Date(meeting.meeting_time).toLocaleString(
                              "en-US",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              },
                            )}
                          </Text>
                        </VStack>
                        {meeting.profiles ? (
                          <VStack className="items-end">
                            <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
                              👤 {meeting.profiles.full_name}
                            </Text>
                            <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
                              📍 {meeting.location}
                            </Text>
                          </VStack>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            action="primary"
                            onPress={() => handleVolunteerClick(meeting)}
                          >
                            <ButtonText>{t("community.volunteer")}</ButtonText>
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  ))
                ) : (
                  <Text className="text-typography-gray-500">
                    {t("community.noUpcomingMeetings")}
                  </Text>
                )}
              </VStack>
            </VStack>
          ) : (
            <VStack className="flex-1 gap-4">
              <Button
                onPress={() => router.push("/groups/create")}
                className="mb-4"
              >
                <ButtonText>{t("community.createMokjang")}</ButtonText>
              </Button>
              <GroupList
                groups={groups}
                initialRequestedGroups={requestedGroupIds}
                isLoading={isLoadingGroups || isLoadingRequests}
              />
            </VStack>
          )}
        </VStack>

        {/* Volunteer Modal */}
        <Modal
          isOpen={showVolunteerModal}
          onClose={() => setShowVolunteerModal(false)}
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size="lg">{t("community.volunteerTitle")}</Heading>
              <ModalCloseButton>
                <X size={24} color="gray" />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack className="gap-4 py-4">
                <Text>{t("community.volunteerDescription")}</Text>
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText>
                      {t("community.enterLocation")}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      value={locationInput}
                      onChangeText={setLocationInput}
                      placeholder={t("community.locationPlaceholder")}
                    />
                  </Input>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowVolunteerModal(false)}
                className="mr-2"
              >
                <ButtonText>{t("common.cancel")}</ButtonText>
              </Button>
              <Button
                onPress={() => volunteerMutation.mutate()}
                isDisabled={volunteerMutation.isPending}
              >
                <ButtonText>
                  {volunteerMutation.isPending
                    ? t("common.saving")
                    : t("common.confirm")}
                </ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
