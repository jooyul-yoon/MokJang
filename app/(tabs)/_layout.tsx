import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BrandColors, BrandColorsDark, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { Images } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: isDark
          ? BrandColorsDark.fg[3]
          : BrandColors.fg[3],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 80,
          paddingTop: 6,
          paddingBottom: 14,
          backgroundColor: isDark ? BrandColorsDark.bg[0] : BrandColors.bg[0],
          borderTopColor: isDark
            ? BrandColorsDark.border.subtle
            : BrandColors.border.subtle,
          shadowColor: "#000",
          shadowOpacity: 0.03,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Fonts?.sans,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("tabs.mokjang"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          href: null,
          title: t("tabs.bible"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="book.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: t("tabs.feed"),
          tabBarIcon: ({ color }) => <Images size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
