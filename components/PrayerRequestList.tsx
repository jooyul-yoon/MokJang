import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchPrayerRequests } from "@/services/PrayerRequestApi";
import { Group } from "@/types/typeGroups";
import { PrayerRequest } from "@/types/typePrayerRequest";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChevronRight, MessageSquare } from "lucide-react-native";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity } from "react-native";
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
          <Card className="dark:bg-background-card-dark rounded-xl border border-gray-100 bg-white p-0 shadow-sm dark:border-gray-800">
            <VStack>
              {[...filteredRequests]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )
                .slice(0, 5)
                .map((request: PrayerRequest, index: number) => (
                  <React.Fragment key={request.id}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/prayer-requests/${request.id}`)
                      }
                      activeOpacity={0.7}
                    >
                      <HStack className="items-center gap-3 p-4">
                        <Avatar size="sm">
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

                        <VStack className="flex-1 justify-center">
                          <HStack className="items-center justify-between">
                            <HStack className="items-center gap-2">
                              <Text className="text-sm font-bold text-typography-900">
                                {request.profiles?.full_name}
                              </Text>
                              <Text className="text-[11px] text-typography-400">
                                {new Date(
                                  request.created_at,
                                ).toLocaleDateString()}
                              </Text>
                            </HStack>
                          </HStack>
                          <Text
                            numberOfLines={1}
                            className="mt-0.5 text-[13px] leading-normal text-typography-600"
                          >
                            {request.content}
                          </Text>
                        </VStack>
                      </HStack>
                    </TouchableOpacity>
                    {index < Math.min(filteredRequests.length - 1, 4) && (
                      <Divider className="mx-4 bg-gray-100 dark:bg-gray-800" />
                    )}
                  </React.Fragment>
                ))}
              {filteredRequests.length > 5 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/prayer-requests")}
                  className="border-t border-gray-100 p-3 dark:border-gray-800"
                >
                  <HStack className="items-center justify-center space-x-1">
                    <Text className="text-sm font-medium text-blue-500">
                      {t("common.seeMore", "더보기")}
                    </Text>
                    <Icon
                      as={ChevronRight}
                      size="sm"
                      className="text-blue-500"
                    />
                  </HStack>
                </TouchableOpacity>
              )}
            </VStack>
          </Card>
        )}
      </VStack>
    </VStack>
  );
}
