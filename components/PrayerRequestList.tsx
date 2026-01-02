import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fab, FabIcon } from "@/components/ui/fab";
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
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  createPrayerRequest,
  fetchPrayerRequests,
  Group,
  PrayerRequest,
} from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Circle, MessageSquare, Plus, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

interface PrayerRequestListProps {
  userGroup?: Group;
}

export default function PrayerRequestList({
  userGroup,
}: PrayerRequestListProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "group">(
    userGroup ? "group" : "public",
  );

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["prayerRequests"],
    queryFn: fetchPrayerRequests,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return createPrayerRequest(content, visibility, userGroup?.id ?? null);
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowModal(false);
        setContent("");
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

  const filteredRequests = useMemo(() => {
    if (userGroup) {
      return requests.filter(
        (request: PrayerRequest) => request.group_id === userGroup?.id,
      );
    } else {
      return requests.filter(
        (request: PrayerRequest) => request.visibility === "public",
      );
    }
  }, [requests, userGroup]);

  if (isLoading) {
    return <ActivityIndicator className="mt-4" />;
  }

  return (
    <VStack className="flex-1 px-4 pb-20">
      <VStack className="gap-3">
        {filteredRequests.length === 0 ? (
          <Text className="text-center text-typography-500">
            {t("community.noPrayerRequests", "No prayer requests yet.")}
          </Text>
        ) : (
          filteredRequests.map((request: PrayerRequest) => (
            <Pressable
              key={request.id}
              onPress={() => router.push(`/prayer-requests/${request.id}`)}
            >
              <Card className="dark:bg-background-card-dark rounded-lg bg-white p-4">
                <HStack className="mb-2 items-center justify-between">
                  <HStack className="items-center gap-2">
                    <Avatar size="xs">
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
                      <Text className="text-sm font-bold text-typography-900">
                        {request.profiles?.full_name}
                      </Text>
                      <Text className="text-xs text-typography-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text className="text-xs uppercase text-typography-400">
                    {request.visibility === "public"
                      ? t("common.public", "Public")
                      : t("common.group", "Group")}
                  </Text>
                </HStack>
                <Text
                  numberOfLines={3}
                  className="mb-3 leading-normal text-typography-700"
                >
                  {request.content}
                </Text>
                <HStack className="justify-end">
                  <HStack className="items-center gap-1">
                    <Icon
                      as={MessageSquare}
                      size="xs"
                      className="text-typography-400"
                    />
                    <Text className="text-xs text-typography-400">
                      {t("common.comments", "Comments")}
                    </Text>
                  </HStack>
                </HStack>
              </Card>
            </Pressable>
          ))
        )}
      </VStack>

      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => setShowModal(true)}
        className="mb-4 mr-4"
      >
        <FabIcon as={Plus} />
      </Fab>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
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
                    {userGroup && (
                      <Radio value="group" size="md">
                        <RadioIndicator>
                          <RadioIcon as={Circle} />
                        </RadioIndicator>
                        <RadioLabel>{t("common.group", "Group")}</RadioLabel>
                      </Radio>
                    )}
                    <Radio value="public" size="md">
                      <RadioIndicator>
                        <RadioIcon as={Circle} />
                      </RadioIndicator>
                      <RadioLabel>{t("common.public", "Public")}</RadioLabel>
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
              onPress={() => setShowModal(false)}
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
    </VStack>
  );
}
