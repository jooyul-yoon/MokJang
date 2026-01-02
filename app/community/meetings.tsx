import { GoBackHeader } from "@/components/GoBackHeader";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Fab, FabIcon } from "@/components/ui/fab";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
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
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  createMeeting,
  fetchMeetings,
  fetchUserGroup,
  fetchUserProfile,
  Meeting,
  volunteerForMeeting,
} from "@/services/api";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleIcon, Plus, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { useLocalSearchParams } from "expo-router";

export default function MeetingsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { date } = useLocalSearchParams<{ date: string }>();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: userGroup } = useQuery({
    queryKey: ["userGroup"],
    queryFn: fetchUserGroup,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings", userGroup?.id],
    queryFn: () =>
      userGroup ? fetchMeetings(userGroup.id) : Promise.resolve([]),
    enabled: !!userGroup,
  });

  const isLeader = userGroup?.leader_id === userProfile?.id;

  // --- Calendar State ---
  const [selectedDate, setSelectedDate] = useState(
    date || new Date().toISOString().split("T")[0],
  );

  // --- Create Meeting State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeetingType, setNewMeetingType] = useState<"mokjang" | "general">(
    "mokjang",
  );
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingDate, setNewMeetingDate] = useState(new Date());
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [newMeetingLocation, setNewMeetingLocation] = useState("");
  const [newMeetingMemo, setNewMeetingMemo] = useState("");

  // --- Volunteer State ---
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!userGroup) return;
      await createMeeting({
        group_id: userGroup.id,
        type: newMeetingType,
        title:
          newMeetingType === "general"
            ? newMeetingTitle
            : t("community.mokjangMeeting"),
        meeting_time: newMeetingDate.toISOString(),
        location: isVolunteerOpen ? undefined : newMeetingLocation,
        memo: newMeetingMemo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setShowCreateModal(false);
      resetCreateForm();
    },
    onError: (error) => {
      console.error("Create meeting failed:", error);
    },
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

  const resetCreateForm = () => {
    setNewMeetingType("mokjang");
    setNewMeetingTitle("");
    setNewMeetingDate(new Date());
    setIsVolunteerOpen(false);
    setNewMeetingLocation("");
    setNewMeetingMemo("");
  };

  const handleVolunteerClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setLocationInput(meeting.location || userGroup?.region || "");
    setShowVolunteerModal(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newMeetingDate;
    setNewMeetingDate(currentDate);
  };

  // --- Filtered Meetings ---
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) =>
      new Date(meeting.meeting_time)
        .toLocaleString("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .startsWith(selectedDate),
    );
  }, [meetings, selectedDate]);

  // --- Marked Dates for Calendar ---
  const markedDates = useMemo(() => {
    const marks: any = {};
    meetings.forEach((meeting) => {
      const date = meeting.meeting_time.split("T")[0];
      marks[date] = {
        marked: true,
        dotColor: "#059669", // primary-600 equivalent
      };
    });

    // Add selected date highlighting
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#000000",
      disableTouchEvent: true,
    };

    return marks;
  }, [meetings, selectedDate]);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <GoBackHeader title={t("community.meetings")} />

      <Box className="p-4">
        <Calendar
          onCalendarDayPress={(dateId: string) => {
            setSelectedDate(new Date(dateId).toISOString().split("T")[0]);
          }}
          calendarMonthId={toDateId(new Date())}
          calendarDayHeight={40}
          calendarActiveDateRanges={[
            {
              startId: selectedDate,
              endId: selectedDate,
            },
          ]}
        />
      </Box>

      <ScrollView contentContainerClassName="p-4 pb-24 gap-4">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting: Meeting) => (
            <VStack key={meeting.id}>
              <Divider />
              <HStack className="dark:bg-background-card items-start justify-between rounded-lg py-3">
                <VStack className="flex-1 gap-1">
                  <HStack className="items-center gap-2">
                    <Text className="font-bold text-typography-black dark:text-typography-white">
                      {meeting.title ||
                        (meeting.type === "mokjang"
                          ? t("community.mokjangMeeting")
                          : t("community.generalMeeting"))}
                    </Text>
                  </HStack>

                  <Text className="text-sm text-typography-600 dark:text-typography-400">
                    {new Date(meeting.meeting_time).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Text>
                  {meeting.memo && (
                    <Text className="text-xs italic text-typography-500">
                      {meeting.memo}
                    </Text>
                  )}
                </VStack>

                <VStack className="items-end gap-1">
                  {(meeting.type === "mokjang" || meeting.host_id) &&
                    (meeting.profiles ? (
                      <VStack className="items-end">
                        <Text className="text-sm text-typography-600 dark:text-typography-400">
                          👤 {meeting.profiles.full_name}
                        </Text>
                        <Text className="text-sm text-typography-600 dark:text-typography-400">
                          📍 {meeting.location || t("community.tbd")}
                        </Text>
                      </VStack>
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        action="primary"
                        onPress={() => handleVolunteerClick(meeting)}
                      >
                        <ButtonText>{t("community.volunteer")}</ButtonText>
                      </Button>
                    ))}
                  {meeting.type === "general" &&
                    !meeting.host_id &&
                    meeting.location && (
                      <Text className="text-sm text-typography-600 dark:text-typography-400">
                        📍 {meeting.location}
                      </Text>
                    )}
                </VStack>
              </HStack>
            </VStack>
          ))
        ) : (
          <Text className="text-center text-typography-500">
            {t("community.noMeetingsOnDate")}
          </Text>
        )}
      </ScrollView>

      {/* FAB for Leaders */}
      {isLeader && (
        <Fab
          placement="bottom right"
          size="lg"
          onPress={() => setShowCreateModal(true)}
          className="mb-8 mr-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700"
        >
          <FabIcon as={Plus} />
        </Fab>
      )}

      {/* Create Meeting Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{t("community.addMeeting")}</Heading>
            <ModalCloseButton>
              <Icon as={X} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack className="gap-4 py-4">
              {/* Type Selection */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>
                    {t("community.meetingType")}
                  </FormControlLabelText>
                </FormControlLabel>
                <RadioGroup
                  value={newMeetingType}
                  onChange={(val) =>
                    setNewMeetingType(val as "mokjang" | "general")
                  }
                >
                  <HStack space="md">
                    <Radio value="mokjang" size="md">
                      <RadioIndicator>
                        <RadioIcon as={CircleIcon} />
                      </RadioIndicator>
                      <RadioLabel>{t("community.mokjangMeeting")}</RadioLabel>
                    </Radio>
                    <Radio value="general" size="md">
                      <RadioIndicator>
                        <RadioIcon as={CircleIcon} />
                      </RadioIndicator>
                      <RadioLabel>{t("community.generalMeeting")}</RadioLabel>
                    </Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {/* Title (Condition) */}
              {newMeetingType === "general" && (
                <FormControl isRequired={true}>
                  <FormControlLabel>
                    <FormControlLabelText>
                      {t("common.title")}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      value={newMeetingTitle}
                      onChangeText={setNewMeetingTitle}
                      placeholder={t("community.enterTitle")}
                    />
                  </Input>
                </FormControl>
              )}

              {/* Date & Time */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>
                    {t("community.selectTime")}
                  </FormControlLabelText>
                </FormControlLabel>
                <HStack>
                  <DateTimePicker
                    value={newMeetingDate}
                    mode="datetime"
                    display="default"
                    onChange={onDateChange}
                    themeVariant="light"
                  />
                </HStack>
              </FormControl>

              {/* Volunteer Toggle */}
              <HStack className="items-center justify-between">
                <Text>{t("community.volunteerAvailable")}</Text>
                <Switch
                  value={isVolunteerOpen}
                  onValueChange={setIsVolunteerOpen}
                />
              </HStack>

              {/* Location Input (Condition) */}
              {!isVolunteerOpen && (
                <FormControl isRequired={true}>
                  <FormControlLabel>
                    <FormControlLabelText>
                      {t("community.enterLocation")}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      value={newMeetingLocation}
                      onChangeText={setNewMeetingLocation}
                      placeholder={t("community.locationPlaceholder")}
                    />
                  </Input>
                </FormControl>
              )}

              {/* Memo */}
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>
                    {t("community.memo")}
                  </FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    value={newMeetingMemo}
                    onChangeText={setNewMeetingMemo}
                    placeholder={t("community.enterMemo")}
                  />
                </Input>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowCreateModal(false)}
              className="mr-2"
            >
              <ButtonText>{t("common.cancel")}</ButtonText>
            </Button>
            <Button
              onPress={() => createMutation.mutate()}
              isDisabled={createMutation.isPending}
            >
              <ButtonText>
                {createMutation.isPending
                  ? t("common.saving")
                  : t("common.confirm")}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
              <Icon as={X} />
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
    </SafeAreaView>
  );
}
