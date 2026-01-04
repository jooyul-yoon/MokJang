import { CalendarTheme } from "@marceloterreiro/flash-calendar";

export const getCalendarTheme = (
  colorScheme: "light" | "dark" | null | undefined,
): CalendarTheme => {
  const isDark = colorScheme === "dark";
  const linearAccent = isDark ? "#BB86FC" : "#03DAC6";
  const todayColor = isDark ? "#03DAC6" : "#BB86FC";
  const sundayColor = isDark ? "#FF8347" : "#FF0000";
  const BORDER_RADIUS = 9999;

  if (isDark) {
    return {
      rowMonth: {
        container: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        content: {
          color: "rgba(255, 255, 255, 1)",
          fontWeight: "700",
        },
      },
      rowWeek: {
        container: {
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.1)",
        },
      },
      itemWeekName: {
        container: { width: 50 },
        content: { color: "rgba(255, 255, 255, 1)" },
      },
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: linearAccent,
        },
      },
      itemDay: {
        idle: ({ date, isDifferentMonth, isStartOfWeek }) => ({
          container: {
            borderWidth: 0,
            borderRadius: BORDER_RADIUS,
          },
          content: {
            color: isDifferentMonth
              ? "rgba(255, 255, 255, 0.2)"
              : isStartOfWeek
                ? sundayColor
                : "rgba(255, 255, 255)",
            fontWeight: "normal",
          },
        }),
        today: ({ date }) => ({
          container: {
            borderWidth: 0,
          },
          content: {
            color: todayColor,
            fontWeight: "bold",
          },
        }),
        active: ({ isEndOfRange, isStartOfRange, isToday, isStartOfWeek }) => ({
          container: {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderTopLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderBottomLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderTopRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
            borderBottomRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
          },
          content: {
            color: isToday
              ? todayColor
              : isStartOfWeek
                ? sundayColor
                : "rgba(255, 255, 255, 1)",
            fontWeight: isToday ? "bold" : "normal",
          },
        }),
      },
    };
  } else {
    return {
      rowMonth: {
        container: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        content: {
          textAlign: "center",
          color: "rgba(0, 0, 0, 0.5)",
          fontWeight: "700",
        },
      },
      rowWeek: {
        container: {
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0, 0, 0, 0.1)",
          borderStyle: "solid",
        },
      },
      itemWeekName: { content: { color: "rgba(0, 0, 0, 0.5)" } },
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: linearAccent,
        },
      },
      itemDay: {
        idle: ({ date, isDifferentMonth, isStartOfWeek }) => ({
          container: {
            borderWidth: 0,
            borderRadius: BORDER_RADIUS,
          },
          content: {
            color: isDifferentMonth
              ? "rgba(0, 0, 0, 0.2)"
              : isStartOfWeek
                ? sundayColor
                : "#000000",
            fontWeight: "normal",
          },
        }),
        today: ({ date }) => ({
          container: {
            backgroundColor: "transparent",
            borderWidth: 0,
          },
          content: {
            color: todayColor,
            fontWeight: "bold",
          },
        }),
        active: ({ isEndOfRange, isStartOfRange, isToday, isStartOfWeek }) => ({
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            borderTopLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderBottomLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderTopRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
            borderBottomRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
          },
          content: {
            color: isToday
              ? todayColor
              : isStartOfWeek
                ? sundayColor
                : "rgba(0, 0, 0, 1)",
            fontWeight: isToday ? "bold" : "normal",
          },
        }),
      },
    };
  }
};
