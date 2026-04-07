import TabTitle from "@/components/shared/TabTitle";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  getNotifications,
  readNotification,
} from "@/services/notificationsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Bell, Heart } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Notification = {
  id: string;
  title: string;
  content: string;
  url: string;
  is_read: boolean;
  type: string;
  created_at: string;
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchOnWindowFocus: true,
  });

  // console.log(data);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    setIsRefreshing(false);
  };

  const renderItem = ({ item }: { item: Notification }) => {
    return (
      <Pressable
        key={item.id}
        className="flex-row rounded-md border-b border-gray-200 px-4 py-4 active:bg-gray-50/5 dark:border-gray-800"
        onPress={async () => {
          if (!item.is_read) {
            await readNotification(item.id);
            await queryClient.invalidateQueries({
              queryKey: ["notifications"],
            });
          }
          router.push(item.url as any);
        }}
      >
        <HStack className="mr-4 items-center">
          <Center
            className={`mr-2 h-1 w-1 rounded-full ${item.is_read ? "bg-gray-300/0" : "bg-primary-500"}`}
          />
          <Center className="h-10 w-10 rounded-full bg-primary-50/20">
            <Icon
              as={item.type === "prayer" ? Heart : Bell}
              className="h-7 w-7"
            />
          </Center>
        </HStack>
        <VStack className="flex-1">
          <Heading className={`${item.is_read ? "font-normal" : "font-bold"}`}>
            {item.title}
          </Heading>
          <Text numberOfLines={3} className="text-lg text-typography-500">
            {item.content}
          </Text>
          <Text className="mt-2 text-typography-500">
            {new Date(item.created_at).toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </VStack>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <VStack className="flex-1 pb-10">
        <TabTitle
          title={t("tabs.notifications", { defaultValue: "Notifications" })}
        />
        {isLoading ? (
          <Center className="flex-1">
            <ActivityIndicator />
          </Center>
        ) : data?.length === 0 ? (
          <Center className="flex-1">
            <Text className="text-center text-typography-500">
              {t("notifications.empty", {
                defaultValue: "You have no new notifications.",
              })}
            </Text>
          </Center>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        )}
      </VStack>
    </SafeAreaView>
  );
}
