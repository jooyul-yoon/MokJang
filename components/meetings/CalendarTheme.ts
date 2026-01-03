import { CalendarTheme } from "@marceloterreiro/flash-calendar";

export const getCalendarTheme = (
  colorScheme: "light" | "dark" | null | undefined,
  markedDates: Date[],
  linearAccent: string = "#585ABF",
): CalendarTheme => {
  const isDark = colorScheme === "dark";
  
  const isDateMarked = (date: Date) => {
    return markedDates.some(
      (d) =>
        d.toLocaleDateString().split("T")[0] ===
        date.toLocaleDateString().split("T")[0],
    );
  };

  if (isDark) {
    return {
      rowMonth: {
        content: {
          textAlign: "left",
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
            borderColor: isDateMarked(date) ? linearAccent : "transparent",
            borderWidth: 1,
            borderRadius: 9999,
          },
          content: {
            color: isDateMarked(date) ? linearAccent : "rgba(255, 255, 255)",
            fontWeight: isDateMarked(date) ? "bold" : "normal",
          },
        }),
        today: ({ date }) => ({
          container: {
            borderColor: isDateMarked(date) ? linearAccent : "blue",
            borderWidth: 1,
            borderRadius: 9999,
          },
          content: {
            color: isDateMarked(date) ? linearAccent : "blue",
            fontWeight: isDateMarked(date) ? "bold" : "normal",
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
            borderColor: isDateMarked(date) ? linearAccent + "66" : "transparent",
            borderWidth: 1,
            borderRadius: 9999,
          },
          content: {
            color: isDateMarked(date) ? linearAccent : "#000000",
            fontWeight: isDateMarked(date) ? "bold" : "normal",
          },
        }),
        today: ({ date }) => ({
          container: {
            borderColor: isDateMarked(date) ? linearAccent + "66" : "blue",
            borderRadius: 9999,
          },
          content: {
            color: isDateMarked(date) ? linearAccent : "blue",
            fontWeight: isDateMarked(date) ? "bold" : "normal",
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
