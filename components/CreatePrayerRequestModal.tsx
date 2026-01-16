import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
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
import { createPrayerRequest, Group } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Lock, Users, X } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { ModalAvoidKeyboardView } from "./shared/ModalAvoidKeyboardView";

interface CreatePrayerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGroup?: Group | null;
  defaultVisibility?: "public" | "group" | "private";
}

export default function CreatePrayerRequestModal({
  isOpen,
  onClose,
  userGroup,
  defaultVisibility = "public",
}: CreatePrayerRequestModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "group" | "private">(
    defaultVisibility,
  );

  const mutation = useMutation({
    mutationFn: async () => {
      return createPrayerRequest(content, visibility, userGroup?.id ?? null);
    },
    onSuccess: (data) => {
      if (data.success) {
        onClose();
        setContent("");
        setVisibility(defaultVisibility);
        queryClient.invalidateQueries({ queryKey: ["prayerRequests"] });
      } else {
        console.error(data.error);
      }
    },
  });

  const handleCreate = () => {
    if (content.trim()) {
      mutation.mutate();
    }
  };

  const VisibilityOption = ({
    value,
    label,
    icon: IconComponent,
    description,
  }: {
    value: "public" | "group" | "private";
    label: string;
    icon: any;
    description: string;
  }) => {
    const isSelected = visibility === value;
    return (
      <Pressable
        onPress={() => setVisibility(value)}
        className={`flex-1 rounded-xl border p-3 ${
          isSelected
            ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
            : "dark:bg-background-card-dark border-outline-200 bg-white dark:border-outline-800"
        }`}
      >
        <VStack className="items-center gap-2">
          <Icon
            as={IconComponent}
            size="md"
            className={
              isSelected
                ? "text-primary-600 dark:text-primary-400"
                : "text-typography-400"
            }
          />
          <Text
            className={`font-medium ${
              isSelected
                ? "text-primary-900 dark:text-primary-100"
                : "text-typography-700 dark:text-typography-300"
            }`}
          >
            {label}
          </Text>
        </VStack>
      </Pressable>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalAvoidKeyboardView>
        <ModalContent className="rounded-2xl border-0 bg-white dark:bg-background-900">
          <ModalHeader className="border-b-0 pb-2">
            <Heading
              size="md"
              className="text-typography-900 dark:text-typography-100"
            >
              {t("community.newPrayerRequest", "New Prayer Request")}
            </Heading>
            <ModalCloseButton>
              <Icon
                as={X}
                className="text-typography-400 hover:text-typography-600"
              />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack className="gap-6 py-2">
              {/* Visibility Selection */}
              <VStack className="gap-2">
                <Text
                  size="xs"
                  className="font-bold uppercase tracking-wider text-typography-500"
                >
                  {t("common.visibility", "Visibility")}
                </Text>
                <HStack className="gap-3">
                  <VisibilityOption
                    value="public"
                    label={t("common.public", "Public")}
                    icon={Globe}
                    description="Visible to everyone"
                  />
                  {userGroup && (
                    <VisibilityOption
                      value="group"
                      label={t("common.group", "Group")}
                      icon={Users}
                      description="Visible to group only"
                    />
                  )}
                  <VisibilityOption
                    value="private"
                    label={t("common.private", "Private")}
                    icon={Lock}
                    description="Visible only to you"
                  />
                </HStack>
              </VStack>

              {/* Content Input */}
              <VStack className="gap-2">
                <Text
                  size="xs"
                  className="font-bold uppercase tracking-wider text-typography-500"
                >
                  {t("common.content", "Content")}
                </Text>
                <Input
                  size="xl"
                  className="h-32 rounded-xl border-outline-200 bg-background-50 p-1 dark:border-outline-700 dark:bg-background-800"
                >
                  <InputField
                    multiline
                    textAlignVertical="top"
                    placeholder={t(
                      "community.prayerRequestPlaceholder",
                      "Share your prayer request...",
                    )}
                    value={content}
                    onChangeText={setContent}
                    className="font-normal leading-relaxed text-typography-900 dark:text-typography-100"
                  />
                </Input>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter className="border-t-0 pt-2">
            <Button
              variant="outline"
              action="secondary"
              onPress={onClose}
              className="mr-2 rounded-full border-outline-200 px-6"
            >
              <ButtonText className="font-medium text-typography-600">
                {t("common.cancel", "Cancel")}
              </ButtonText>
            </Button>
            <Button
              onPress={handleCreate}
              isDisabled={!content.trim() || mutation.isPending}
              className="rounded-full px-6"
            >
              {mutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText className="font-bold">
                  {t("common.post", "Post")}
                </ButtonText>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalAvoidKeyboardView>
    </Modal>
  );
}
