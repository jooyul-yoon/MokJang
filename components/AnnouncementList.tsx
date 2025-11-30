import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Eye, MessageCircle, Share2 } from "lucide-react-native";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading?: boolean;
}

export default function AnnouncementList({
  announcements,
  isLoading = false,
}: AnnouncementListProps) {
  if (isLoading) {
    return (
      <VStack className="gap-4">
        <Heading
          size="md"
          className="mb-2 text-typography-black dark:text-typography-white"
        >
          Church Announcements
        </Heading>
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
    <VStack className="gap-4">
      <Heading
        size="md"
        className="mb-2 text-typography-black dark:text-typography-white"
      >
        Church Announcements
      </Heading>
      {announcements.map((announcement) => (
        <Card
          key={announcement.id}
          className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
        >
          {/* Header */}
          <HStack className="mb-3 items-center gap-3">
            <Avatar size="xs">
              <AvatarFallbackText>Admin</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
                }}
              />
            </Avatar>
            <VStack>
              <Text className="font-bold text-typography-black dark:text-typography-white">
                Church Admin
              </Text>
              <Text className="text-typography-gray-500 text-xs">
                {new Date(announcement.created_at).toLocaleDateString()} •{" "}
                {new Date(announcement.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </VStack>
          </HStack>

          {/* Body */}
          <VStack className="mb-4">
            <Heading
              size="sm"
              className="mb-2 text-typography-black dark:text-typography-white"
            >
              {announcement.title}
            </Heading>
            <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
              {announcement.content}
            </Text>
          </VStack>

          <Divider className="my-2 bg-background-100" />

          {/* Footer Actions */}
          <HStack className="mt-1 justify-between">
            <Button
              variant="link"
              action="secondary"
              size="sm"
              className="flex-1 gap-2"
            >
              <Icon as={Eye} className="text-typography-gray-500 h-4 w-4" />
              <ButtonText className="text-typography-gray-500 text-xs">
                Read
              </ButtonText>
            </Button>
            <Button
              variant="link"
              action="secondary"
              size="sm"
              className="flex-1 gap-2"
            >
              <Icon
                as={MessageCircle}
                className="text-typography-gray-500 h-4 w-4"
              />
              <ButtonText className="text-typography-gray-500 text-xs">
                Comment
              </ButtonText>
            </Button>
            <Button
              variant="link"
              action="secondary"
              size="sm"
              className="flex-1 gap-2"
            >
              <Icon as={Share2} className="text-typography-gray-500 h-4 w-4" />
              <ButtonText className="text-typography-gray-500 text-xs">
                Share
              </ButtonText>
            </Button>
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}
