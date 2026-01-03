import { CalendarTheme } from "@marceloterreiro/flash-calendar";

export const getCalendarTheme = (
  colorScheme: "light" | "dark" | null | undefined,
  linearAccent: string = "#585ABF",
): CalendarTheme => {
  const isDark = colorScheme === "dark";

  if (isDark) {
    return {
      rowMonth: {
        content: {
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.5)",
          fontWeight: "700",
        },
      },
      rowWeek: {
        container: {
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.1)",
          borderStyle: "solid",
        },
      },
      itemWeekName: { content: { color: "rgba(255, 255, 255, 0.5)" } },
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: linearAccent,
        },
      },
      itemDay: {
        idle: ({ date }) => ({
          container: {
            borderColor: "transparent",
            borderWidth: 1,
            borderRadius: 8,
          },
          content: {
            color: "rgba(255, 255, 255)",
            fontWeight: "normal",
          },
        }),
        today: ({ date }) => ({
          container: {
            borderWidth: 0,
          },
          content: {
            color: "#585ABF",
            fontWeight: "normal",
          },
        }),
        active: ({ isEndOfRange, isStartOfRange }) => ({
          container: {
            backgroundColor: linearAccent,
            borderTopLeftRadius: isStartOfRange ? 9999 : 0,
            borderBottomLeftRadius: isStartOfRange ? 9999 : 0,
            borderTopRightRadius: isEndOfRange ? 9999 : 0,
            borderBottomRightRadius: isEndOfRange ? 9999 : 0,
          },
          content: {
            color: "red",
          },
        }),
      },
    };
  } else {
    return {
      rowMonth: {
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
        idle: ({ date }) => ({
          container: {
            borderColor: "transparent",
            borderWidth: 1,
            borderRadius: 9999,
          },
          content: {
            color: "#000000",
            fontWeight: "normal",
          },
        }),
        today: ({ date }) => ({
          container: {
            borderColor: "blue",
            borderRadius: 9999,
          },
          content: {
            color: "blue",
            fontWeight: "normal",
          },
        }),
        active: ({ isEndOfRange, isStartOfRange }) => ({
          container: {
            backgroundColor: linearAccent,
            borderTopLeftRadius: isStartOfRange ? 9999 : 0,
            borderBottomLeftRadius: isStartOfRange ? 9999 : 0,
            borderTopRightRadius: isEndOfRange ? 9999 : 0,
            borderBottomRightRadius: isEndOfRange ? 9999 : 0,
          },
          content: {
            color: "#ffffff",
          },
        }),
      },
    };
  }
};
