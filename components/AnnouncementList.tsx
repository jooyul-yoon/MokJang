import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchAnnouncements, markAnnouncementAsRead } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Check, Eye, MessageCircle } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl } from "react-native";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Pressable } from "./ui/pressable";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read_count?: number;
  is_read?: boolean;
  comment_count?: number;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function AnnouncementList() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  // Local state to track read status optimistically
  const [readStates, setReadStates] = useState<{
    [key: string]: { isRead: boolean; count: number };
  }>({});

  const handleRead = async (id: string, currentCount: number = 0) => {
    // Optimistic update
    setReadStates((prev) => ({
      ...prev,
      [id]: { isRead: true, count: currentCount + 1 },
    }));

    const { success } = await markAnnouncementAsRead(id);
    if (!success) {
      // Revert if failed
      setReadStates((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["announcements"] });
    setRefreshing(false);
  };

  const renderItem = ({ item: announcement }: { item: Announcement }) => {
    const isRead = readStates[announcement.id]?.isRead ?? announcement.is_read;
    const readCount =
      readStates[announcement.id]?.count ?? announcement.read_count ?? 0;

    return (
      <Pressable
        onPress={() => router.push(`/announcements/${announcement.id}`)}
        className="border-b border-outline-50 p-4 active:bg-background-50"
      >
        {/* Header */}
        <HStack className="gap-3">
          <Avatar>
            <AvatarFallbackText>
              {announcement.profiles?.full_name || t("announcements.admin")}
            </AvatarFallbackText>
            <AvatarImage
              source={{
                uri:
                  announcement.profiles?.avatar_url ||
                  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
              }}
            />
          </Avatar>
          <VStack className="flex-1">
            <HStack className="items-center gap-2">
              <Text className="font-bold text-typography-black dark:text-typography-white">
                {announcement.title}
              </Text>
              <HStack className="items-center gap-2">
                <Text className="text-xs text-typography-700">
                  {announcement.profiles?.full_name || t("announcements.admin")}
                  {" • "}
                  {new Date(announcement.created_at).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )}
                </Text>
              </HStack>
            </HStack>

            {/* Body */}
            <VStack className="my-2">
              <Text className="pr-4 text-sm text-typography-800 dark:text-typography-400">
                {announcement.content}
              </Text>
            </VStack>

            {/* Footer Actions */}
            <HStack className="items-center gap-4">
              <Button
                variant="link"
                action={isRead ? "primary" : "secondary"}
                size="sm"
                className="gap-0.5"
                onPress={() => {
                  if (!isRead) {
                    handleRead(announcement.id, readCount);
                  }
                }}
                disabled={isRead}
              >
                <ButtonIcon
                  as={isRead ? Check : Eye}
                  className="text-typography-800"
                />

                {readCount > 0 && (
                  <ButtonText className="text-xs text-typography-400">
                    {readCount}
                  </ButtonText>
                )}
              </Button>
              <Button
                variant="link"
                action="secondary"
                size="sm"
                className="gap-2"
                onPress={() => router.push(`/announcements/${announcement.id}`)}
              >
                <ButtonIcon
                  as={MessageCircle}
                  className="text-typography-800"
                />
                {(announcement.comment_count ?? 0) > 0 && (
                  <ButtonText className="text-xs text-typography-400">
                    {announcement.comment_count}
                  </ButtonText>
                )}
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <VStack className="gap-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
          >
            <HStack className="mb-3 items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <VStack className="gap-1">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </VStack>
            </HStack>
            <SkeletonText _lines={1} className="mb-2 h-6 w-3/4" />
            <SkeletonText _lines={2} className="mb-4 h-4 w-full" />
            <Skeleton className="h-8 w-full rounded" />
          </Card>
        ))}
      </VStack>
    );
  }

  return (
    <FlatList
      data={announcements}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ gap: 0 }}
    />
  );
}
