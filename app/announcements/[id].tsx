import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  createComment,
  fetchAnnouncements,
  fetchComments,
} from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const announcement = announcements.find((a) => a.id === id);

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => fetchComments(id as string),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (content: string) => createComment(id as string, content),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
  });

  const handleSendComment = () => {
    if (commentText.trim()) {
      mutation.mutate(commentText);
    }
  };

  if (!announcement) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <VStack className="flex-1">
          {/* Header */}
          <HStack className="items-center border-b border-outline-100 p-4">
            <Button
              variant="link"
              onPress={() => router.back()}
              className="mr-4 p-0"
            >
              <ButtonIcon
                as={ArrowLeft}
                size="xl"
                className="text-typography-900"
              />
            </Button>
            <Heading size="md" className="text-typography-900">
              {t("announcements.create")}{" "}
              {/* Reusing "New Announcement" or similar title key if appropriate, or just "Announcement" */}
            </Heading>
          </HStack>

          <ScrollView className="flex-1 p-4">
            {/* Announcement Content */}
            <Card className="dark:bg-background-card-dark mb-6 rounded-md bg-white px-4 py-4 shadow-sm">
              <HStack className="mb-4 items-center gap-3">
                <Avatar>
                  <AvatarFallbackText>
                    {announcement.profiles?.full_name ||
                      t("announcements.admin")}
                  </AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri:
                        announcement.profiles?.avatar_url ||
                        "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
                    }}
                  />
                </Avatar>
                <VStack>
                  <Text className="font-bold text-typography-black dark:text-typography-white">
                    {announcement.profiles?.full_name ||
                      t("announcements.churchAdmin")}
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

              <Heading
                size="md"
                className="mb-2 text-typography-black dark:text-typography-white"
              >
                {announcement.title}
              </Heading>
              <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-base leading-6">
                {announcement.content}
              </Text>
            </Card>

            <Divider className="my-2 bg-background-100" />

            {/* Comments Section */}
            <VStack className="gap-4 pb-8">
              <Heading size="sm" className="mb-2 text-typography-900">
                {t("announcements.comment")} ({comments.length})
              </Heading>

              {isLoadingComments ? (
                <ActivityIndicator />
              ) : (
                comments.map((comment) => (
                  <HStack key={comment.id} className="items-start gap-3">
                    <Avatar size="xs">
                      <AvatarFallbackText>
                        {comment.profiles?.full_name}
                      </AvatarFallbackText>
                      <AvatarImage
                        source={{
                          uri:
                            comment.profiles?.avatar_url ||
                            "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
                        }}
                      />
                    </Avatar>
                    <VStack className="dark:bg-background-card-dark flex-1 rounded-lg bg-background-50 p-3">
                      <HStack className="mb-1 items-center justify-between">
                        <Text className="text-sm font-bold text-typography-900">
                          {comment.profiles?.full_name}
                        </Text>
                        <Text className="text-xs text-typography-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <Text className="text-sm text-typography-700">
                        {comment.content}
                      </Text>
                    </VStack>
                  </HStack>
                ))
              )}
            </VStack>
          </ScrollView>

          {/* Comment Input */}
          <HStack className="items-center gap-2 border-t border-outline-100 bg-white p-4 dark:bg-background-dark">
            <Input className="flex-1" size="md">
              <InputField
                placeholder={t("announcements.comment") + "..."}
                value={commentText}
                onChangeText={setCommentText}
              />
            </Input>
            <Button
              size="md"
              variant="solid"
              action="primary"
              isDisabled={!commentText.trim() || mutation.isPending}
              onPress={handleSendComment}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonIcon as={Send} />
              )}
            </Button>
          </HStack>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
