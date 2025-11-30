import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ScrollView } from "react-native";

export default function BibleScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        <VStack className="h-[80vh] flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-typography-black dark:text-typography-white">
            {t("tabs.bible")}
          </Text>
          <Text className="mt-2 text-typography-500">Coming Soon</Text>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
