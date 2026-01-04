import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Calendar,
  CalendarProps,
  CalendarTheme,
  useCalendar,
} from "@marceloterreiro/flash-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useMemo } from "react";

const WEEK_HEIGHT = 40;
const DAY_HEIGHT = 50;

interface IMeetingCalendar extends CalendarProps {
  onPressPreviousMonth: () => void;
  onPressNextMonth: () => void;
  theme: CalendarTheme;
  markedDates: Date[];
}

function MeetingCalendar({
  calendarMonthId,
  onCalendarDayPress,
  onPressPreviousMonth,
  onPressNextMonth,
  theme,
  calendarActiveDateRanges,
  markedDates,
}: IMeetingCalendar) {
  const { calendarRowMonth, weekDaysList, weeksList } = useCalendar({
    calendarMonthId,
    calendarActiveDateRanges,
  });

  const markedDateSet = useMemo(() => {
    return new Set(
      markedDates.map((date) => {
        try {
          return date.toLocaleDateString("sv-SE").split("T")[0];
        } catch (e) {
          return "";
        }
      }),
    );
  }, [markedDates]);

  return (
    <Calendar.VStack>
      <Calendar.HStack style={theme.rowMonth?.container}>
        <Button
          variant="link"
          onPress={onPressPreviousMonth}
          className="rounded-full px-4"
        >
          <ButtonIcon as={ChevronLeft} className="text-primary-200" />
        </Button>
        <Text style={theme.rowMonth?.content}>{calendarRowMonth}</Text>
        <Button
          variant="link"
          onPress={onPressNextMonth}
          className="rounded-full px-4"
        >
          <ButtonIcon as={ChevronRight} className="text-primary-200" />
        </Button>
      </Calendar.HStack>

      <Calendar.Row.Week spacing={4} theme={theme.rowWeek}>
        {weekDaysList.map((day, i) => (
          <Calendar.Item.WeekName
            height={WEEK_HEIGHT}
            key={i}
            theme={theme.itemWeekName}
          >
            {day}
          </Calendar.Item.WeekName>
        ))}
      </Calendar.Row.Week>
      <Calendar.Item.Empty height={WEEK_HEIGHT} />

      {weeksList.map((week, i) => (
        <Calendar.Row.Week key={i}>
          {week.map((day) => (
            <Calendar.Item.Day.Container
              dayHeight={DAY_HEIGHT}
              daySpacing={4}
              isStartOfWeek={day.isStartOfWeek}
              key={day.id}
            >
              <Calendar.VStack grow>
                <Calendar.Item.Day
                  height={30}
                  metadata={day}
                  onPress={onCalendarDayPress}
                  theme={theme.itemDay}
                >
                  {day.displayLabel}
                </Calendar.Item.Day>
                {markedDateSet.has(day.id) && (
                  <Box className="absolute bottom-3 left-1/2 right-1/2 mx-auto h-1 w-1 -translate-x-1/2 transform rounded-full bg-primary-500" />
                )}
              </Calendar.VStack>
            </Calendar.Item.Day.Container>
          ))}
        </Calendar.Row.Week>
      ))}
    </Calendar.VStack>
  );
}

export default MeetingCalendar;
