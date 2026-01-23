import { GoBackHeader } from "@/components/GoBackHeader";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import {
  createComment,
  deleteAnnouncement,
  fetchAnnouncements,
  fetchComments,
} from "@/services/AnnouncementApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MoreVertical, Send, Trash, X } from "lucide-react-native";
import { useEffect, useState } from "react";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

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

  // Determine tag style (reused logic)
  let tagStyle = {
    tagText: "NEWS",
    tagColor: "text-amber-500",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    darkBgColor: "dark:bg-amber-900/20",
  };
  switch (announcement.type) {
    case "meeting":
      tagStyle = {
        tagText: "MEETING",
        tagColor: "text-blue-500",
        dotColor: "bg-blue-500",
        bgColor: "bg-blue-50",
        darkBgColor: "dark:bg-blue-900/20",
      };
      break;
    case "retreat":
      tagStyle = {
        tagText: "RETREAT",
        tagColor: "text-green-500",
        dotColor: "bg-green-500",
        bgColor: "bg-green-50",
        darkBgColor: "dark:bg-green-900/20",
      };
      break;
    case "picnic":
      tagStyle = {
        tagText: "PICNIC",
        tagColor: "text-orange-500",
        dotColor: "bg-orange-500",
        bgColor: "bg-orange-50",
        darkBgColor: "dark:bg-orange-900/20",
      };
      break;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <VStack className="flex-1">
          <GoBackHeader
            title={announcement.title}
            rightElement={
              announcement.author_id === userId && (
                <Menu
                  offset={10}
                  placement="bottom right"
                  trigger={({ ...triggerProps }) => {
                    return (
                      <Pressable {...triggerProps}>
                        <Icon
                          as={MoreVertical}
                          className="text-typography-900"
                        />
                      </Pressable>
                    );
                  }}
                >
                  <MenuItem
                    key="delete"
                    textValue="Delete"
                    onPress={() => setShowDeleteModal(true)}
                  >
                    <Icon as={Trash} className="mr-2 text-error-500" />
                    <MenuItemLabel size="sm" className="text-error-500">
                      {t("common.delete")}
                    </MenuItemLabel>
                  </MenuItem>
                </Menu>
              )
            }
          />

          <ScrollView className="flex-1 px-5 pt-2">
            <VStack space="sm" className="pb-10">
              {/* Author & Meta Info */}
              <HStack className="my-4 items-center justify-between">
                <HStack space="md" className="items-center">
                  <Avatar size="md">
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
                  <VStack space="xs">
                    {/* Header Section: Tag & Title */}
                    <HStack space="xs" className="items-center">
                      <Box
                        className={`h-2 w-2 rounded-full ${tagStyle.dotColor}`}
                      />
                      <Text
                        className={`font-extra-bold text-xs uppercase tracking-wider ${tagStyle.tagColor}`}
                      >
                        {tagStyle.tagText}
                      </Text>
                    </HStack>
                    <Text className="text-md font-semibold text-typography-900">
                      {announcement.profiles?.full_name ||
                        t("announcements.churchAdmin")}
                    </Text>
                    <Text className="text-xs text-typography-600">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
              </HStack>

              {/* Main Content */}
              <Text className="text-base leading-7 text-typography-700">
                {announcement.content}
              </Text>

              <Divider className="my-2 bg-background-100 dark:bg-background-800" />

              {/* Comments Section */}
              <VStack space="md">
                <HStack className="items-center justify-between">
                  <Heading size="sm" className="text-typography-900">
                    {t("announcements.comment")}
                    <Text className="ml-1 text-typography-500">
                      ({comments.length})
                    </Text>
                  </Heading>
                </HStack>

                {isLoadingComments ? (
                  <ActivityIndicator className="py-4" />
                ) : (
                  <VStack space="md">
                    {comments.map((comment) => (
                      <HStack
                        key={comment.id}
                        space="md"
                        className="items-start"
                      >
                        <Avatar className="mt-1 h-10 w-10">
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
                        <VStack className="flex-1 rounded-2xl rounded-tl-none bg-background-50 px-4 py-3">
                          <HStack className="mb-1 items-center justify-between">
                            <Text className="text-xs font-bold text-typography-900">
                              {comment.profiles?.full_name}
                            </Text>
                            <Text className="text-2xs text-typography-500">
                              {new Date(
                                comment.created_at,
                              ).toLocaleDateString()}
                            </Text>
                          </HStack>
                          <Text className="text-typography-600">
                            {comment.content}
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
            </VStack>
          </ScrollView>

          {/* Comment Input */}
          <Box className="border-t border-outline-100 px-4 py-3 dark:border-outline-200">
            <HStack space="sm" className="items-center">
              <Input
                variant="outline"
                size="md"
                className="flex-1 rounded-full border-outline-200 bg-background-50 dark:border-outline-700"
              >
                <InputField
                  placeholder={t("announcements.comment") + "..."}
                  value={commentText}
                  onChangeText={setCommentText}
                />
              </Input>
              <Button
                size="md"
                className="h-10 w-10 rounded-full p-0"
                variant="solid"
                action="primary"
                isDisabled={!commentText.trim() || mutation.isPending}
                onPress={handleSendComment}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ButtonIcon as={Send} />
                )}
              </Button>
            </HStack>
          </Box>
        </VStack>
      </KeyboardAvoidingView>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" className="text-typography-900">
              {t("common.delete")}
            </Heading>
            <ModalCloseButton>
              <Icon as={X} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text size="sm" className="text-typography-500">
              {t("common.deleteConfirmation")}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              action="secondary"
              onPress={() => setShowDeleteModal(false)}
              variant="outline"
            >
              <ButtonText>{t("common.cancel")}</ButtonText>
            </Button>
            <Button
              onPress={async () => {
                const { success, error } = await deleteAnnouncement(
                  id as string,
                );
                if (success) {
                  setShowDeleteModal(false);
                  queryClient.invalidateQueries({
                    queryKey: ["announcements"],
                  });
                  router.back();
                } else {
                  console.error(error);
                }
              }}
              action="negative"
            >
              <ButtonText>{t("common.delete")}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
