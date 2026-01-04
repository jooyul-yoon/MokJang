import { Button, ButtonIcon } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Calendar,
  CalendarProps,
  CalendarTheme,
  useCalendar,
} from "@marceloterreiro/flash-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

const WEEK_HEIGHT = 40;
const DAY_HEIGHT = 50;

interface IMeetingCalendar extends CalendarProps {
  onPressPreviousMonth: () => void;
  onPressNextMonth: () => void;
  theme: CalendarTheme;
}

function MeetingCalendar({
  calendarMonthId,
  onCalendarDayPress,
  onPressPreviousMonth,
  onPressNextMonth,
  theme,
  calendarActiveDateRanges,
}: IMeetingCalendar) {
  const { calendarRowMonth, weekDaysList, weeksList } = useCalendar({
    calendarMonthId,
    calendarActiveDateRanges,
  });

  return (
    <Calendar.VStack>
      <Calendar.HStack style={theme.rowMonth?.container}>
        <Button variant="link" onPress={onPressPreviousMonth}>
          <ButtonIcon as={ChevronLeft} />
        </Button>
        <Text style={theme.rowMonth?.content}>{calendarRowMonth}</Text>
        <Button variant="link" onPress={onPressNextMonth}>
          <ButtonIcon as={ChevronRight} />
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
              <Calendar.Item.Day
                height={DAY_HEIGHT}
                metadata={day}
                onPress={onCalendarDayPress}
                theme={theme.itemDay}
              >
                {day.displayLabel}
              </Calendar.Item.Day>
            </Calendar.Item.Day.Container>
          ))}
        </Calendar.Row.Week>
      ))}
    </Calendar.VStack>
  );
}

export default MeetingCalendar;
