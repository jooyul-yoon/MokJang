import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <VStack className="pb-10">
          <Heading className="mb-8 text-3xl font-bold text-typography-black dark:text-typography-white">
            {t("tabs.notifications", { defaultValue: "Notifications" })}
          </Heading>

          <View className="items-center justify-center py-20">
            <Text className="text-center text-typography-500">
              {t("notifications.empty", {
                defaultValue: "You have no new notifications.",
              })}
            </Text>
          </View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
