import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createAnnouncement } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { success, error } = await createAnnouncement(title, content);
      if (success) {
        await queryClient.invalidateQueries({ queryKey: ["announcements"] });
        Alert.alert("Success", "Announcement created successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", error || "Failed to create announcement");
      }
    } catch (e) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light p-4 dark:bg-background-dark">
      <VStack className="space-y-6">
        <Heading className="text-2xl font-bold text-typography-black dark:text-typography-white">
          New Announcement
        </Heading>

        <VStack className="space-y-2">
          <Text className="text-sm font-medium text-typography-500">Title</Text>
          <TextInput
            className="rounded-md border border-outline-300 p-3 text-typography-black dark:border-outline-700 dark:text-typography-white"
            placeholder="Enter title"
            placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
            value={title}
            onChangeText={setTitle}
          />
        </VStack>

        <VStack className="space-y-2">
          <Text className="text-sm font-medium text-typography-500">
            Content
          </Text>
          <TextInput
            className="h-40 rounded-md border border-outline-300 p-3 text-typography-black dark:border-outline-700 dark:text-typography-white"
            placeholder="Enter announcement content"
            placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />
        </VStack>

        <Button
          onPress={handleCreate}
          isDisabled={isSubmitting}
          className="mt-4"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText>Post Announcement</ButtonText>
          )}
        </Button>

        <Button
          variant="outline"
          action="secondary"
          onPress={() => router.back()}
          isDisabled={isSubmitting}
        >
          <ButtonText>Cancel</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
