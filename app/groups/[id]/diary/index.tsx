import { Center } from "@/components/ui/center";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchGroupDiaries } from "@/services/api";
import { Diary } from "@/types/typeGroups";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Clock, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupDiaryScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: diaries = [], isLoading } = useQuery({
    queryKey: ["groupDiaries", groupId],
    queryFn: () => fetchGroupDiaries(groupId as string),
    enabled: !!groupId,
  });

  const onRefresh = () => {
    onRefreshHelper(setRefreshing, ["groupDiaries"]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-background-dark"
      edges={["top"]}
    >
      {/* Custom Header */}
      <HStack className="items-center justify-between border-b border-outline-100 px-5 pb-2 pt-4">
        <HStack className="flex-1 items-start gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="-ml-2 mt-1 p-1"
          >
            <Icon as={ArrowLeft} size="xl" className="text-typography-900" />
          </TouchableOpacity>
          <VStack>
            <Text className="mb-0.5 text-[14px] font-bold uppercase tracking-widest text-primary-600">
              {t("community.mokjangCommunity", "MOKJANG COMMUNITY")}
            </Text>
            <Heading size="xl" className="font-bold text-typography-900">
              {t("community.diary")}
            </Heading>
          </VStack>
        </HStack>
      </HStack>

      {/* Cards List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <Center className="py-10">
            <ActivityIndicator size="large" />
          </Center>
        ) : diaries.length === 0 ? (
          <Center className="py-10">
            <Text className="text-typography-500">
              {t("community.no_diary")}
            </Text>
          </Center>
        ) : (
          diaries.map((diary: Diary) => (
            <TouchableOpacity
              key={diary.id}
              activeOpacity={0.7}
              onPress={() => {
                // Future expansion: Navigate to diary detail
              }}
              className="border-b border-outline-100 p-5"
            >
              <VStack className="gap-2">
                <Heading size="md" className="text-typography-900">
                  {diary.title}
                </Heading>
                <Text
                  className="text-[15px] leading-[24px] text-typography-600"
                  numberOfLines={3}
                >
                  {diary.content}
                </Text>
                <HStack className="mt-2 items-center gap-1">
                  <Icon as={Clock} size="xs" className="text-typography-400" />
                  <Text className="text-xs text-typography-400">
                    {formatDate(diary.created_at)}
                  </Text>
                </HStack>
              </VStack>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Write Action Button */}
      <Fab
        size="lg"
        placement="bottom right"
        className="mb-4 mr-2 bg-primary-600 shadow-md hover:bg-primary-700 active:bg-primary-800"
        onPress={() => router.push(`/groups/${groupId}/diary/create`)}
      >
        <FabIcon as={Plus} className="text-white" />
      </Fab>
    </SafeAreaView>
  );
}
