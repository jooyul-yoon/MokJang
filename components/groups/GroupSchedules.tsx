import { useMeetingActions } from "@/hooks/useMeetingActions";
import { fetchMeetingsByMonth } from "@/services/MeetingApi";
import { Group } from "@/types/typeGroups";
import { CalendarActiveDateRange } from "@marceloterreiro/flash-calendar";
import { useQuery } from "@tanstack/react-query";
import { add, startOfMonth, sub } from "date-fns";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { getCalendarTheme } from "../meetings/CalendarTheme";
import MeetingCalendar from "../meetings/MeetingCalendar";
import UpcomingMeeting from "../meetings/UpcomingMeeting";
import { VStack } from "../ui/vstack";

interface GroupSchedulesProps {
  selectedGroup: Group;
}

export default function GroupSchedules({ selectedGroup }: GroupSchedulesProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
  );

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings", selectedGroup?.id, selectedDate.substring(0, 7)],
    queryFn: () =>
      selectedGroup
        ? fetchMeetingsByMonth(
            selectedGroup.id,
            startOfMonth(new Date(selectedDate)),
          )
        : Promise.resolve([]),
    enabled: !!selectedGroup,
  });

  const { createState, volunteerState, actions, status } = useMeetingActions(
    selectedGroup,
    t,
    selectedDate,
  );

  const calendarActiveDateRanges = useMemo<CalendarActiveDateRange[]>(
    () => [
      {
        startId: selectedDate,
        endId: selectedDate,
      },
    ],
    [selectedDate],
  );
  const markedDates = useMemo(() => {
    return meetings.map((meeting) => new Date(meeting.meeting_time));
  }, [meetings]);

  const calendarTheme = useMemo(
    () => getCalendarTheme(colorScheme),
    [colorScheme],
  );

  return (
    <VStack>
      <MeetingCalendar
        calendarMonthId={selectedDate}
        onCalendarDayPress={(dateId: string) => {
          setSelectedDate(new Date(dateId).toISOString().split("T")[0]);
          // Sync new meeting date with selected date (+ offset if needed)
          createState.setDate(
            new Date(new Date(dateId).getTime() + 24 * 60 * 60 * 1000),
          );
        }}
        onPressPreviousMonth={() => {
          setSelectedDate(
            sub(new Date(selectedDate), { months: 1 })
              .toISOString()
              .split("T")[0],
          );
        }}
        onPressNextMonth={() => {
          setSelectedDate(
            add(new Date(selectedDate), { months: 1 })
              .toISOString()
              .split("T")[0],
          );
        }}
        calendarActiveDateRanges={calendarActiveDateRanges}
        theme={calendarTheme}
        markedDates={markedDates}
      />
      <UpcomingMeeting meetings={meetings} />
    </VStack>
  );
}
