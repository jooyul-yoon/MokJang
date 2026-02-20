import { GoBackHeader } from "@/components/GoBackHeader";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchMeetingById, updateMeeting } from "@/services/MeetingApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditMeetingTitleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");

  const { data: meeting, isLoading } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => fetchMeetingById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (meeting?.title) {
      setTitle(meeting.title);
    }
  }, [meeting]);

  const updateMutation = useMutation({
    mutationFn: (newTitle: string) => updateMeeting(id, { title: newTitle }),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["meeting", id] });
        queryClient.invalidateQueries({ queryKey: ["meetings"] });
        router.back();
      } else {
        alert(t("common.error") + ": " + data.error);
      }
    },
  });

  if (isLoading || !meeting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <GoBackHeader title="" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const isFormValid = title.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <GoBackHeader title="" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <VStack className="flex-1 px-4 pt-4">
            <Text className="mb-8 text-2xl font-bold text-typography-900">
              {t("community.enterMeetingName", "모임 이름을 입력해주세요")}
            </Text>

            <VStack space="sm">
              <Text className="text-sm font-medium text-primary-500">
                {t("community.meetingName", "모임 이름")}
              </Text>
              <Input
                variant="underlined"
                size="lg"
                className="items-center border-b-primary-500 pb-1"
              >
                <InputField
                  autoFocus
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t("community.meetingName", "모임 이름")}
                  className="pl-0 text-lg"
                />
                {title.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setTitle("")}
                    className="ml-2"
                  >
                    <Icon
                      as={XCircle}
                      size="md"
                      className="text-typography-400"
                    />
                  </TouchableOpacity>
                )}
              </Input>
            </VStack>

            <View className="flex-1 justify-end pb-8">
              <Button
                size="xl"
                variant="solid"
                action="primary"
                className="w-full rounded-2xl"
                isDisabled={!isFormValid || updateMutation.isPending}
                onPress={() => updateMutation.mutate(title)}
              >
                {updateMutation.isPending && (
                  <ButtonSpinner color="white" className="mr-2" />
                )}
                <ButtonText>{t("common.next", "다음")}</ButtonText>
              </Button>
            </View>
          </VStack>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
