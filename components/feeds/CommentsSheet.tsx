import { Comment, useAddComment, useComments } from "@/api/feeds/comments";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
} from "@/components/ui/actionsheet";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchUserProfile } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Icon } from "../ui/icon";

export interface CommentsSheetRef {
  present: (postId: string) => void;
  dismiss: () => void;
}

const EMOJIS = ["❤️", "🙏", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];

const CommentItem = React.memo(
  ({
    comment,
    onReply,
  }: {
    comment: Comment;
    onReply: (c: Comment) => void;
  }) => {
    return (
      <VStack className="mb-6 px-4">
        <HStack className="items-start gap-3">
          <Avatar size="sm" className="h-9 w-9">
            {comment.profiles?.avatar_url ? (
              <AvatarImage
                source={{ uri: comment.profiles.avatar_url }}
                alt="avatar"
              />
            ) : (
              <AvatarFallbackText>
                {comment.profiles?.full_name}
              </AvatarFallbackText>
            )}
          </Avatar>
          <VStack className="flex-1">
            <HStack className="items-center gap-2">
              <Text className="text-[13px] font-bold text-typography-900">
                {comment.profiles?.full_name}
              </Text>
              <Text className="text-xs text-typography-400">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </Text>
            </HStack>
            <Text className="mt-0.5 text-[14px] leading-5 text-typography-900">
              {comment.content}
            </Text>
          </VStack>
        </HStack>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <VStack className="ml-12 mt-4 gap-4">
            {comment.replies.map((reply) => (
              <HStack key={reply.id} className="items-start gap-3">
                <Avatar size="xs" className="h-6 w-6">
                  {reply.profiles?.avatar_url ? (
                    <AvatarImage
                      source={{ uri: reply.profiles.avatar_url }}
                      alt="avatar"
                    />
                  ) : (
                    <AvatarFallbackText>
                      {reply.profiles?.full_name}
                    </AvatarFallbackText>
                  )}
                </Avatar>
                <VStack className="flex-1">
                  <HStack className="items-center gap-2">
                    <Text className="text-[12px] font-bold text-typography-900">
                      {reply.profiles?.full_name}
                    </Text>
                    <Text className="text-[11px] text-typography-400">
                      {formatDistanceToNow(new Date(reply.created_at), {
                        addSuffix: true,
                      })}
                    </Text>
                  </HStack>
                  <Text className="mt-0.5 text-[13px] leading-4 text-typography-900">
                    {reply.content}
                  </Text>
                </VStack>
                <Pressable className="pt-1">
                  <IconSymbol name="heart" size={12} color="#999" />
                </Pressable>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    );
  },
);
CommentItem.displayName = "CommentItem";

export const CommentsSheet = forwardRef<CommentsSheetRef>((props, ref) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [snapPoints, setSnapPoints] = useState<number[]>([50, 80]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: comments, isLoading } = useComments(postId);
  const { mutateAsync: addComment, isPending } = useAddComment();
  const { data: userProfile, isLoading: isLoadingUserProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPostId(null);
    setReplyingTo(null);
    setSnapPoints([50, 80]);
  }, []);

  useImperativeHandle(ref, () => ({
    present: (id: string) => {
      setPostId(id);
      setIsOpen(true);
    },
    dismiss: handleClose,
  }));

  const handleEmojiPress = useCallback((emoji: string) => {
    // This will be handled in the sub-component but we need a stable handler if passed
  }, []);

  return (
    <Actionsheet
      isOpen={isOpen}
      onClose={handleClose}
      snapPoints={snapPoints}
      isKeyboardDismissable
    >
      <ActionsheetBackdrop />
      <ActionsheetContent className="bg-white px-2 dark:bg-background-dark">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={180}
          className="w-full flex-1"
        >
          <VStack className="w-full flex-1">
            {/* Header */}
            <Box className="flex-row items-center justify-center border-b border-outline-50 px-4 py-4">
              <Text className="text-base font-bold text-typography-900">
                {t("feed.comment.title")}
              </Text>
            </Box>

            {isLoading ? (
              <Box className="flex-1 items-center justify-center">
                <ActivityIndicator size="small" />
              </Box>
            ) : (
              <ActionsheetFlatList
                data={comments}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={{ paddingVertical: 16 }}
                renderItem={({ item }: { item: any }) => (
                  <CommentItem comment={item} onReply={setReplyingTo} />
                )}
                ListEmptyComponent={
                  <Box className="items-center py-20">
                    <Text className="text-sm text-typography-400">
                      {t("feed.comment.noComments")}
                    </Text>
                  </Box>
                }
                automaticallyAdjustKeyboardInsets={true}
              />
            )}

            {/* Input Area */}
            <CommentInputSection
              key={postId || "none"}
              postId={postId}
              userProfile={userProfile}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onFocus={() => {
                if (snapPoints.length > 1) {
                  setSnapPoints([80]);
                }
              }}
              addComment={addComment}
            />
          </VStack>
        </KeyboardAvoidingView>
      </ActionsheetContent>
    </Actionsheet>
  );
});
CommentsSheet.displayName = "CommentsSheet";

// Separate Input Area to isolate state re-renders
const CommentInputSection = React.memo(
  ({
    postId,
    userProfile,
    replyingTo,
    setReplyingTo,
    onFocus,
    addComment,
  }: {
    postId: string | null;
    userProfile: any;
    replyingTo: Comment | null;
    setReplyingTo: (c: Comment | null) => void;
    onFocus: () => void;
    addComment: any;
  }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState("");

    const handleSubmit = async () => {
      if (!inputText.trim()) return;
      try {
        await addComment({
          postId: postId || "",
          content: inputText.trim(),
          parentId: replyingTo?.id,
        });
        setInputText("");
        setReplyingTo(null);
        Keyboard.dismiss();
      } catch (e) {
        console.error(e);
      }
    };

    const handleEmojiPress = (emoji: string) => {
      setInputText((prev) => prev + emoji);
    };

    return (
      <VStack className="border-t border-outline-50 px-4 pb-4 pt-4">
        {/* Emoji Shortcuts */}
        <HStack className="mb-4 justify-between px-1">
          {EMOJIS.map((emoji) => (
            <Pressable key={emoji} onPress={() => handleEmojiPress(emoji)}>
              <Text className="text-xl">{emoji}</Text>
            </Pressable>
          ))}
        </HStack>

        {replyingTo && (
          <HStack className="mb-2 items-center justify-between rounded-lg bg-background-50 p-2">
            <Text className="text-xs text-typography-600">
              {t("feed.comment.replyingTo", {
                name: replyingTo.profiles?.full_name,
              })}
            </Text>
            <Pressable onPress={() => setReplyingTo(null)}>
              <IconSymbol name="xmark" size={14} color="#999" />
            </Pressable>
          </HStack>
        )}

        <HStack className="items-center gap-3">
          <Avatar size="sm" className="h-10 w-10">
            <AvatarFallbackText>{userProfile?.full_name}</AvatarFallbackText>
            <AvatarImage
              source={{ uri: userProfile?.avatar_url }}
              alt="avatar"
            />
          </Avatar>
          <Input
            variant="rounded"
            size="md"
            className="h-11 flex-1 border-outline-200 bg-background-50 dark:border-outline-700 dark:bg-background-800"
          >
            <InputField
              placeholder={t("feed.comment.think")}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onFocus={onFocus}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              className="text-[14px]"
            />
            {inputText.trim().length > 0 && (
              <TouchableOpacity
                onPress={handleSubmit}
                className="mr-2 h-8 w-10 items-center justify-center rounded-xl bg-primary-500"
              >
                <Icon as={ArrowUp} size="md" className="text-white" />
              </TouchableOpacity>
            )}
          </Input>
        </HStack>
      </VStack>
    );
  },
);
CommentInputSection.displayName = "CommentInputSection";
