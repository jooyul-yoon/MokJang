import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { Pressable } from "./ui/pressable";

interface Tab {
  en: string;
  ko: string;
  value: string;
  [key: string]: string; // Allow dynamic access for i18n
}

interface HomeTabsProps {
  tabs: Tab[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const HomeTabs = ({ tabs, activeTab, setActiveTab }: HomeTabsProps) => {
  const { i18n } = useTranslation();
  return (
    <HStack className="mb-6 border-b border-outline-100 px-4 md:border-b-0 md:border-transparent">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack space="xl" className="mx-0.5 xl:gap-5 2xl:gap-6">
          {tabs.map((tab) => (
            <Pressable
              key={tab.value}
              className={`my-0.5 py-1 ${
                activeTab === tab ? "border-b-[3px]" : "border-b-0"
              } border-outline-900 hover:border-b-[3px] ${
                activeTab === tab
                  ? "hover:border-outline-900"
                  : "hover:border-outline-200"
              } `}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`${
                  activeTab === tab
                    ? "text-typography-900"
                    : "text-typography-600"
                } font-medium`}
              >
                {tab[i18n.language]}
              </Text>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>
    </HStack>
  );
};
