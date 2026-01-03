import { GoBackHeader } from "@/components/GoBackHeader";
import { Box } from "@/components/ui/box";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Text } from "@/components/ui/text";
import {
  fetchMeetings,
  fetchUserGroup,
  fetchUserProfile,
  Meeting,
} from "@/services/api";
import {
  Calendar,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Extracted Components & Hooks
import { getCalendarTheme } from "@/components/meetings/CalendarTheme";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";
import { MeetingItem } from "@/components/meetings/MeetingItem";
import { VolunteerModal } from "@/components/meetings/VolunteerModal";
import { useMeetingActions } from "@/hooks/useMeetingActions";

export default function MeetingsScreen() {
  const { t } = useTranslation();
  const { date } = useLocalSearchParams<{ date: string }>();
  const colorScheme = useColorScheme();

  // --- Queries ---
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

  // --- Main State ---
  const [selectedDate, setSelectedDate] = useState(
    date || new Date().toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
  );

  // --- Actions Hook ---
  const { createState, volunteerState, actions, status } = useMeetingActions(
    userGroup,
    t,
    selectedDate,
  );

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
    return meetings.map((meeting) => new Date(meeting.meeting_time));
  }, [meetings]);

  const calendarTheme = useMemo(
    () => getCalendarTheme(colorScheme, markedDates),
    [colorScheme, markedDates],
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <GoBackHeader title={t("community.meetings")} />

      <Box className="p-4">
        <Calendar
          onCalendarDayPress={(dateId: string) => {
            setSelectedDate(new Date(dateId).toISOString().split("T")[0]);
            // Sync new meeting date with selected date (+ offset if needed)
            createState.setDate(new Date(new Date(dateId).getTime() + 24 * 60 * 60 * 1000));
          }}
          calendarMonthId={toDateId(new Date())}
          calendarDayHeight={40}
          calendarActiveDateRanges={[
            {
              startId: selectedDate,
              endId: selectedDate,
            },
          ]}
          theme={calendarTheme}
        />
      </Box>

      <ScrollView contentContainerClassName="p-4 pb-24 gap-4">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting: Meeting) => (
            <MeetingItem
              key={meeting.id}
              meeting={meeting}
              t={t}
              onVolunteer={actions.handleVolunteerClick}
            />
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
          onPress={() => createState.setShowModal(true)}
          className="mb-8 mr-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700"
        >
          <FabIcon as={Plus} />
        </Fab>
      )}

      {/* Extracted Modals */}
      <CreateMeetingModal
        isOpen={createState.showModal}
        onClose={() => createState.setShowModal(false)}
        t={t}
        formState={createState}
        onSubmit={actions.createMeeting}
        isSaving={status.isCreating}
      />

      <VolunteerModal
        isOpen={volunteerState.showModal}
        onClose={() => volunteerState.setShowModal(false)}
        t={t}
        locationInput={volunteerState.locationInput}
        setLocationInput={volunteerState.setLocationInput}
        onSubmit={actions.volunteer}
        isSaving={status.isVolunteering}
      />
    </SafeAreaView>
  );
}
