import { GoBackHeader } from "@/components/GoBackHeader";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REGIONS = ["San Jose", "Mountain View", "Fremont"];

export default function CreateGroupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);

  async function createGroup() {
    if (!name || !description || !meetingTime || !region) {
      Alert.alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No user on the session!");

      // 1. Create Group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          meeting_time: meetingTime,
          meeting_location: region,
          leader_id: session.user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Add creator as member (leader)
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: session.user.id,
          role: "leader",
        });

      if (memberError) throw memberError;

      Alert.alert("Success", "MokJang created successfully!");
      router.replace("/(tabs)/community");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <GoBackHeader title="Create MokJang" />
      <ScrollView className="flex-1 p-4">
        <VStack className="space-y-6">
          <Heading className="text-2xl font-bold text-typography-black dark:text-typography-white">
            Create MokJang
          </Heading>

          <VStack className="space-y-2">
            <Text className="text-sm font-medium text-typography-500">
              MokJang Name
            </Text>
            <TextInput
              className="rounded-md border border-outline-300 p-3 text-typography-black dark:border-outline-700 dark:text-typography-white"
              value={name}
              onChangeText={setName}
              placeholder="Enter MokJang name"
              placeholderTextColor="#9CA3AF"
            />
          </VStack>

          <VStack className="space-y-2">
            <Text className="text-sm font-medium text-typography-500">
              Description
            </Text>
            <TextInput
              className="rounded-md border border-outline-300 p-3 text-typography-black dark:border-outline-700 dark:text-typography-white"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your MokJang"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              style={{ minHeight: 80 }}
            />
          </VStack>

          <VStack className="space-y-2">
            <Text className="text-sm font-medium text-typography-500">
              Meeting Time
            </Text>
            <TextInput
              className="rounded-md border border-outline-300 p-3 text-typography-black dark:border-outline-700 dark:text-typography-white"
              value={meetingTime}
              onChangeText={setMeetingTime}
              placeholder="e.g. Fridays at 7 PM"
              placeholderTextColor="#9CA3AF"
            />
          </VStack>

          <VStack className="space-y-2">
            <Text className="text-sm font-medium text-typography-500">
              Region
            </Text>
            <HStack className="flex-wrap gap-2">
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRegion(r)}
                  className={`rounded-full border px-4 py-2 ${
                    region === r
                      ? "border-primary-500 bg-primary-500"
                      : "border-outline-300 bg-transparent dark:border-outline-700"
                  }`}
                >
                  <Text
                    className={`${
                      region === r
                        ? "text-white"
                        : "text-typography-black dark:text-typography-white"
                    }`}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </HStack>
          </VStack>

          <Button onPress={createGroup} isDisabled={loading} className="mt-4">
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText>Create MokJang</ButtonText>
            )}
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
