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
}: IMeetingCalendar) {
  const { calendarRowMonth, weekDaysList, weeksList } = useCalendar({
    calendarMonthId,
  });

  return (
    <Calendar.VStack>
      <Calendar.HStack
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button style={{ padding: 0 }} onPress={onPressPreviousMonth}>
          <ButtonIcon as={ChevronLeft} />
        </Button>
        <Text>{calendarRowMonth}</Text>
        <Button style={{ padding: 0 }} onPress={onPressNextMonth}>
          <ButtonIcon as={ChevronRight} />
        </Button>
      </Calendar.HStack>

      <Calendar.Row.Week theme={theme.rowWeek}>
        {weekDaysList.map((day, i) => (
          <Calendar.Item.WeekName
            height={WEEK_HEIGHT}
            key={i}
            theme={theme.itemWeekName}
          >
            {day}
          </Calendar.Item.WeekName>
        ))}
        <Calendar.Item.Empty height={WEEK_HEIGHT} />
      </Calendar.Row.Week>

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
