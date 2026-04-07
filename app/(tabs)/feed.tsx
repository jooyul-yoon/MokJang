import FeedGrid from "@/components/feeds/FeedGrid";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Feed() {
  const { t } = useTranslation();

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-background-dark"
      edges={["top"]}
    >
      <HStack className="items-center px-4 pb-2 pt-2">
        <Heading size="xl" className="font-bold text-gray-900 dark:text-white">
          VCHUNG {t("tabs.feed")}
        </Heading>
      </HStack>
      <FeedGrid scrollEnabled={true} />
    </SafeAreaView>
  );
}
