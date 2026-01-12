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
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createPrayerRequest, Group } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Circle, X } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

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
      // If private, we might still want to associate with group if in group context,
      // or maybe not. For now, let's keep group_id association as it helps with "My Group" filtering context,
      // but we must strictly filter by user_id for private items.
      return createPrayerRequest(content, visibility, userGroup?.id ?? null);
    },
    onSuccess: (data) => {
      if (data.success) {
        onClose();
        setContent("");
        // Reset visibility to default if needed, or keep last selection
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md" className="text-typography-900">
            {t("community.newPrayerRequest", "New Prayer Request")}
          </Heading>
          <ModalCloseButton>
            <Icon as={X} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack className="gap-4 py-2">
            <VStack className="gap-1">
              <Text size="sm" className="font-medium text-typography-900">
                {t("common.content", "Content")}
              </Text>
              <Input size="lg" className="h-24">
                <InputField
                  multiline
                  textAlignVertical="top"
                  placeholder={t(
                    "community.prayerRequestPlaceholder",
                    "Share your prayer request...",
                  )}
                  value={content}
                  onChangeText={setContent}
                />
              </Input>
            </VStack>
            <VStack className="gap-2">
              <Text size="sm" className="font-medium text-typography-900">
                {t("common.visibility", "Visibility")}
              </Text>
              <RadioGroup value={visibility} onChange={setVisibility}>
                <HStack className="gap-4">
                  <Radio value="public" size="md">
                    <RadioIndicator>
                      <RadioIcon as={Circle} />
                    </RadioIndicator>
                    <RadioLabel>{t("common.public", "Public")}</RadioLabel>
                  </Radio>
                  {userGroup && (
                    <Radio value="group" size="md">
                      <RadioIndicator>
                        <RadioIcon as={Circle} />
                      </RadioIndicator>
                      <RadioLabel>{t("common.group", "Group")}</RadioLabel>
                    </Radio>
                  )}
                  <Radio value="private" size="md">
                    <RadioIndicator>
                      <RadioIcon as={Circle} />
                    </RadioIndicator>
                    <RadioLabel>{t("common.private", "Private")}</RadioLabel>
                  </Radio>
                </HStack>
              </RadioGroup>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            className="mr-2"
          >
            <ButtonText>{t("common.cancel", "Cancel")}</ButtonText>
          </Button>
          <Button
            onPress={handleCreate}
            isDisabled={!content.trim() || mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText>{t("common.post", "Post")}</ButtonText>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
