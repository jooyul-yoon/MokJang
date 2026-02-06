import { CalendarTheme } from "@marceloterreiro/flash-calendar";

export const getCalendarTheme = (
  colorScheme: "light" | "dark" | null | undefined,
): CalendarTheme => {
  const isDark = colorScheme === "dark";
  const linearAccent = isDark ? "#BB86FC" : "#03DAC6";
  const sundayColor = isDark ? "#FF6347" : "#FF0000";
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
          marginBottom: 4,
        },
      },
      itemWeekName: {
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
            fontSize: 16,
          },
        }),
        today: ({ date }) => ({
          container: {
            borderWidth: 1,
            borderRadius: BORDER_RADIUS,
          },
        }),
        active: ({ isEndOfRange, isStartOfRange, isToday, isStartOfWeek }) => ({
          container: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderWidth: isToday ? 1 : 0,
            borderTopLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderBottomLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderTopRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
            borderBottomRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
          },
          content: {
            color: isStartOfWeek ? sundayColor : "rgba(255, 255, 255, 1)",
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
          marginBottom: 4,
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
        today: ({ date, isHovered }) => ({
          container: {
            backgroundColor: isHovered ? "rgba(0, 0, 0, 0.1)" : "transparent",
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.4)",
            borderTopLeftRadius: BORDER_RADIUS,
            borderBottomLeftRadius: BORDER_RADIUS,
            borderTopRightRadius: BORDER_RADIUS,
            borderBottomRightRadius: BORDER_RADIUS,
          },
        }),
        active: ({ isEndOfRange, isStartOfRange, isToday, isStartOfWeek }) => ({
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderWidth: isToday ? 1 : 0,
            borderColor: "rgba(0, 0, 0, 0.4)",
            borderTopLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderBottomLeftRadius: isStartOfRange ? BORDER_RADIUS : 0,
            borderTopRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
            borderBottomRightRadius: isEndOfRange ? BORDER_RADIUS : 0,
          },
          content: {
            color: isStartOfWeek ? sundayColor : "rgba(0, 0, 0, 1)",
            fontWeight: isToday ? "bold" : "normal",
          },
        }),
      },
    };
  }
};
