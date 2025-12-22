import { GoBackHeader } from "@/components/GoBackHeader";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
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
  createPrayerRequestComment,
  deletePrayerRequest,
  fetchPrayerRequestComments,
  fetchPrayerRequests,
} from "@/services/api";
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

          <ScrollView className="flex-1 p-4">
            {/* Request Content */}
            <HStack className="mb-4 items-center gap-3">
              <Avatar>
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
                <Text className="font-bold text-typography-black dark:text-typography-white">
                  {request.profiles?.full_name}
                </Text>
                <Text className="text-xs text-typography-500 dark:text-typography-400">
                  {new Date(request.created_at).toLocaleDateString()} •{" "}
                  {new Date(request.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </VStack>
              <Text className="ml-auto text-xs uppercase text-typography-400">
                {request.visibility === "public"
                  ? t("common.public", "Public")
                  : t("common.group", "Group")}
              </Text>
            </HStack>

            <Text className="mb-4 text-lg leading-6 text-typography-600 dark:text-typography-400">
              {request.content}
            </Text>

            <Divider className="my-2 bg-background-100" />

            {/* Comments Section */}
            <VStack className="gap-4 pb-8">
              <Heading size="sm" className="mb-2 text-typography-900">
                {t("common.comments", "Comments")} ({comments.length})
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
