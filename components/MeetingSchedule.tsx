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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Group, Meeting, volunteerForMeeting } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface MeetingScheduleProps {
  userGroup: Group;
  meetings: Meeting[];
}

export default function MeetingSchedule({
  userGroup,
  meetings,
}: MeetingScheduleProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

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
    setLocationInput(meeting.location || userGroup.region || "");
    setShowVolunteerModal(true);
  };

  return (
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
                <Text className="text-sm text-typography-600 dark:text-typography-400">
                  {new Date(meeting.meeting_time).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Text>
              </VStack>
              {meeting.profiles ? (
                <VStack className="items-end">
                  <Text className="text-sm text-typography-600 dark:text-typography-400">
                    👤 {meeting.profiles.full_name}
                  </Text>
                  <Text className="text-sm text-typography-600 dark:text-typography-400">
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
        <Text className="text-typography-500">
          {t("community.noUpcomingMeetings")}
        </Text>
      )}

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
    </VStack>
  );
}
