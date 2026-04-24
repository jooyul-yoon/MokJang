import FeedGrid from "@/components/feeds/FeedGrid";
import TabTitle from "@/components/shared/TabTitle";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Pressable } from "@/components/ui/pressable";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Feed() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-white px-6 dark:bg-background-dark"
      edges={["top"]}
    >
      <TabTitle
        title={t("tabs.feed")}
        rightElement={
          <Pressable onPress={() => router.push("/new-post")} className="p-1">
            <IconSymbol name="plus.app" size={24} color="gray" />
          </Pressable>
        }
      />
      <FeedGrid scrollEnabled={true} />
    </SafeAreaView>
  );
}
