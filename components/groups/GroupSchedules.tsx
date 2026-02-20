import { fetchMeetingsByMonth } from "@/services/MeetingApi";
import { Group } from "@/types/typeGroups";
import { CalendarActiveDateRange } from "@marceloterreiro/flash-calendar";
import { useQuery } from "@tanstack/react-query";
import { add, startOfMonth, sub } from "date-fns";
import { t } from "i18next";
import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { getCalendarTheme } from "../meetings/CalendarTheme";
import MeetingCalendar from "../meetings/MeetingCalendar";
import UpcomingMeeting from "../meetings/UpcomingMeeting";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

interface GroupSchedulesProps {
  selectedGroup: Group;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onDateChange: (date: Date) => void;
}

export default function GroupSchedules({
  selectedGroup,
  selectedDate,
  setSelectedDate,
  onDateChange,
}: GroupSchedulesProps) {
  const colorScheme = useColorScheme();

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
          onDateChange(
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

      <HStack space="md" className="my-4 w-full justify-between">
        {/* Upcoming Meetings */}
        <VStack className="w-1/2 overflow-hidden">
          <Text className="text-typography-700">
            {t("community.upcomingMeetings")}
          </Text>
          <UpcomingMeeting meetings={meetings} />
        </VStack>
        {/* selected date */}
        <VStack className="w-1/2 overflow-hidden">
          <Text className="text-typography-700">{selectedDate}</Text>
        </VStack>
      </HStack>
    </VStack>
  );
}
