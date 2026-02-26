import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
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
import { ActivityIndicator } from "react-native";
import { Button, ButtonText } from "./ui/button";
import { Center } from "./ui/center";
import { Heading } from "./ui/heading";

interface PrayerRequestListProps {
  visibility: "public" | "group" | "private";
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
    if (visibility === "public") {
      return requests.filter((request: PrayerRequest) => {
        return request.visibility === "public";
      });
    }
    if (visibility === "group") {
      return requests.filter((request: PrayerRequest) => {
        return (
          request.group_id === userGroup?.id &&
          (request.visibility === "group" || request.visibility === "public")
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
          filteredRequests.map((request: PrayerRequest) => (
            <Pressable
              key={request.id}
              onPress={() => router.push(`/prayer-requests/${request.id}`)}
            >
              <Card className="dark:bg-background-card-dark rounded-lg bg-white p-4">
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
                        {new Date(request.created_at).toLocaleDateString()}
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
            </Pressable>
          ))
        )}
      </VStack>
    </VStack>
  );
}
