import { GoBackHeader } from "@/components/GoBackHeader";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
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
  createPrayerRequestComment,
  deletePrayerRequest,
  fetchPrayerRequestComments,
  fetchPrayerRequests,
  togglePrayerRequestAnswered,
} from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle,
  Circle,
  MoreVertical,
  Send,
  Trash,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrayerRequestDetailScreen() {
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

  const { data: requests = [] } = useQuery({
    queryKey: ["prayerRequests"],
    queryFn: fetchPrayerRequests,
  });

  const request = requests.find((r) => r.id === id);

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["prayerRequestComments", id],
    queryFn: () => fetchPrayerRequestComments(id as string),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (content: string) =>
      createPrayerRequestComment(id as string, content),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({
        queryKey: ["prayerRequestComments", id],
      });
    },
  });

  const handleSendComment = () => {
    if (commentText.trim()) {
      mutation.mutate(commentText);
    }
  };

  const toggleAnsweredMutation = useMutation({
    mutationFn: (isAnswered: boolean) =>
      togglePrayerRequestAnswered(id as string, isAnswered),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerRequests"] });
    },
  });

  const handleDelete = async () => {
    const { success, error } = await deletePrayerRequest(id as string);
    if (success) {
      setShowDeleteModal(false);
      queryClient.invalidateQueries({ queryKey: ["prayerRequests"] });
      router.back();
    } else {
      console.error(error);
    }
  };

  if (!request) {
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
          <GoBackHeader
            title={t("community.prayerRequest", "Prayer Request")}
            rightElement={
              request.user_id === userId && (
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

          <ScrollView
            className="flex-1 bg-background-50 dark:bg-background-950"
            contentContainerClassName="p-4 gap-4"
          >
            {/* Main Request Card */}
            <VStack className="dark:bg-background-card-dark rounded-2xl border border-outline-100 bg-white p-5 shadow-sm dark:border-outline-800">
              {/* Header: Author & Meta */}
              <HStack className="mb-4 items-start justify-between">
                <HStack className="items-center gap-3">
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
                  <VStack>
                    <Text className="font-bold text-typography-900 dark:text-typography-100">
                      {request.profiles?.full_name}
                    </Text>
                    <Text className="text-xs text-typography-500 dark:text-typography-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>

                <HStack className="items-center gap-2">
                  {request.is_answered && (
                    <HStack className="items-center gap-1.5 rounded-full bg-success-100 px-2.5 py-1 dark:bg-success-900/50">
                      <Icon
                        as={CheckCircle}
                        size="xs"
                        className="text-success-600 dark:text-success-400"
                      />
                      <Text className="text-xs font-bold text-success-700 dark:text-success-300">
                        {t("prayer.answered", "Answered")}
                      </Text>
                    </HStack>
                  )}
                  <Text className="rounded-full bg-background-100 px-2.5 py-1 text-xs font-medium text-typography-600 dark:bg-background-800 dark:text-typography-400">
                    {request.visibility === "public"
                      ? t("common.public", "Public")
                      : request.visibility === "private"
                        ? t("common.private", "Private")
                        : t("common.group", "Group")}
                  </Text>
                </HStack>
              </HStack>

              {/* Content */}
              <Text className="mb-6 text-lg leading-relaxed text-typography-800 dark:text-typography-200">
                {request.content}
              </Text>

              {/* Action Button (Owner only) */}
              {userId === request.user_id && (
                <Button
                  variant="outline"
                  action={request.is_answered ? "secondary" : "primary"}
                  onPress={() =>
                    toggleAnsweredMutation.mutate(!request.is_answered)
                  }
                  className="self-end"
                  size="sm"
                  isDisabled={toggleAnsweredMutation.isPending}
                >
                  {toggleAnsweredMutation.isPending ? (
                    <ActivityIndicator size="small" color="gray" />
                  ) : (
                    <>
                      <ButtonIcon
                        as={request.is_answered ? Circle : CheckCircle}
                        className="mr-2"
                      />
                      <ButtonText>
                        {request.is_answered
                          ? t("prayer.markUnanswered", "Mark as Unanswered")
                          : t("prayer.markAnswered", "Mark as Answered")}
                      </ButtonText>
                    </>
                  )}
                </Button>
              )}
            </VStack>

            {/* Comments Section */}
            <VStack className="gap-4 pb-4">
              <HStack className="items-center justify-between px-1">
                <Heading
                  size="sm"
                  className="text-typography-700 dark:text-typography-300"
                >
                  {t("common.comments", "Comments")}
                </Heading>
                <Text className="text-sm font-medium text-typography-500">
                  {comments.length}
                </Text>
              </HStack>

              {isLoadingComments ? (
                <ActivityIndicator className="py-4" />
              ) : comments.length === 0 ? (
                <Text className="py-8 text-center italic text-typography-400">
                  {t(
                    "common.noComments",
                    "No comments yet. Be the first to encourage!",
                  )}
                </Text>
              ) : (
                comments.map((comment) => (
                  <HStack key={comment.id} className="items-start gap-3">
                    <Avatar size="xs" className="mt-1">
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
                    <VStack className="dark:bg-background-card-dark flex-1 rounded-2xl rounded-tl-none bg-white p-3 shadow-sm">
                      <HStack className="mb-1 items-center justify-between">
                        <Text className="text-sm font-semibold text-typography-900 dark:text-typography-100">
                          {comment.profiles?.full_name}
                        </Text>
                        <Text className="text-xs text-typography-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <Text className="text-sm leading-snug text-typography-700 dark:text-typography-300">
                        {comment.content}
                      </Text>
                    </VStack>
                  </HStack>
                ))
              )}
            </VStack>
          </ScrollView>

          {/* Comment Input */}
          <HStack className="dark:bg-background-card-dark items-center gap-3 border-t border-outline-100 bg-white px-4 py-3 pb-8 shadow-sm dark:border-outline-800">
            <Input
              className="flex-1 rounded-full border-outline-200 bg-background-50 dark:border-outline-700 dark:bg-background-900"
              size="md"
            >
              <InputField
                className="px-4"
                placeholder={t(
                  "common.commentPlaceholder",
                  "Write a comment...",
                )}
                value={commentText}
                onChangeText={setCommentText}
              />
            </Input>
            <Button
              size="md"
              variant="solid"
              action="primary"
              className="h-10 w-10 rounded-full p-0"
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
            >
              <ButtonText>{t("common.cancel")}</ButtonText>
            </Button>
            <Button onPress={handleDelete} action="negative">
              <ButtonText>{t("common.delete")}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
