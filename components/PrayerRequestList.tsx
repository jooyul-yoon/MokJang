import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchPrayerRequests } from "@/services/PrayerRequestApi";
import { Group } from "@/types/typeGroups";
import { PrayerRequest } from "@/types/typePrayerRequest";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { Button, ButtonText } from "./ui/button";
import { Center } from "./ui/center";
import { Heading } from "./ui/heading";

interface PrayerRequestListProps {
  visibility: "group" | "private";
  userGroup?: Group | null;
  currentUserId?: string;
}

export default function PrayerRequestList({
  visibility,
  userGroup,
  currentUserId,
}: PrayerRequestListProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: requests = [], isLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["prayerRequests"],
    queryFn: fetchPrayerRequests,
  });

  const filteredRequests = useMemo(() => {
    if (visibility === "group") {
      return requests.filter((request: PrayerRequest) => {
        return (
          request.group_id === userGroup?.id && request.visibility === "group"
        );
      });
    }
    if (visibility === "private") {
      return requests.filter((request: PrayerRequest) => {
        return request.user_id === currentUserId;
      });
    }
    return [];
  }, [requests, userGroup, currentUserId]);

  if (isLoading) {
    return <ActivityIndicator className="mt-4" />;
  }

  return (
    <VStack className="flex-1 pb-20">
      <Heading
        size="lg"
        className="mb-2 font-bold text-gray-900 dark:text-white"
      >
        {t("community.mokjang_prayer_requests")}
      </Heading>
      <VStack className="gap-3">
        {filteredRequests.length === 0 ? (
          <Center className="mt-4 rounded-2xl border border-dashed border-gray-300 px-6 py-16 dark:border-gray-800">
            <VStack className="items-center gap-4">
              <Center className="mb-2 h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Icon as={MessageSquare} className="h-8 w-8 text-blue-500" />
              </Center>
              <VStack className="items-center gap-2">
                <Text className="text-center text-lg font-bold text-gray-900 dark:text-white">
                  {t("community.no_prayer_request")}
                </Text>
                <Text className="px-4 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
                  {t("community.post_first_prayer_request")}
                </Text>
              </VStack>
              <Button
                size="md"
                className="mt-4 rounded-full bg-blue-500 px-8 shadow-sm hover:bg-blue-600 active:bg-blue-700"
                onPress={() => router.push("/prayer-requests/create")}
              >
                <ButtonText className="font-bold text-white">
                  {t("community.post_prayer_request")}
                </ButtonText>
              </Button>
            </VStack>
          </Center>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 overflow-visible px-4"
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            <HStack space="md" className="pr-8">
              {[...filteredRequests]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )
                .slice(0, 5)
                .map((request: PrayerRequest) => (
                  <TouchableOpacity
                    key={request.id}
                    onPress={() =>
                      router.push(`/prayer-requests/${request.id}`)
                    }
                    activeOpacity={0.7}
                    className="w-[280px]"
                  >
                    <Card className="dark:bg-background-card-dark h-full rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-gray-800">
                      <HStack className="mb-2 items-center justify-between">
                        <HStack className="items-center gap-2">
                          <Avatar size="xs">
                            <AvatarFallbackText>
                              {request.profiles?.full_name}
                            </AvatarFallbackText>
                            <AvatarImage
                              source={{
                                uri:
                                  request.profiles?.avatar_url ||
                                  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
                              }}
                            />
                          </Avatar>
                          <VStack>
                            <Text className="text-sm font-bold text-typography-900">
                              {request.profiles?.full_name}
                            </Text>
                            <Text className="text-xs text-typography-500">
                              {new Date(
                                request.created_at,
                              ).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                        <Text className="text-xs uppercase text-typography-400">
                          {request.visibility === "public"
                            ? t("common.public", "Public")
                            : request.visibility === "group"
                              ? t("common.group", "Group")
                              : t("common.private", "Private")}
                        </Text>
                      </HStack>
                      <Text
                        numberOfLines={3}
                        className="mb-3 leading-normal text-typography-700"
                      >
                        {request.content}
                      </Text>
                      <HStack className="justify-end">
                        <HStack className="items-center gap-1">
                          <Icon
                            as={MessageSquare}
                            size="xs"
                            className="text-typography-400"
                          />
                          <Text className="text-xs text-typography-400">
                            {t("common.comments", "Comments")}
                          </Text>
                        </HStack>
                      </HStack>
                    </Card>
                  </TouchableOpacity>
                ))}
            </HStack>
          </ScrollView>
        )}
      </VStack>
    </VStack>
  );
}
