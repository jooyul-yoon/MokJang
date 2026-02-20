import { GoBackHeader } from "@/components/GoBackHeader";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchMeetingById, updateMeeting } from "@/services/MeetingApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditMemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [memo, setMemo] = useState("");

  const { data: meeting, isLoading } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => fetchMeetingById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (meeting?.memo) {
      setMemo(meeting.memo);
    }
  }, [meeting]);

  const updateMutation = useMutation({
    mutationFn: (newMemo: string) => updateMeeting(id, { memo: newMemo }),
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

  // Allow empty memo
  const isFormValid = true;

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
              {t("community.enterMemo", "메모를 입력해주세요")}
            </Text>

            <VStack space="sm">
              <Text className="text-sm font-medium text-primary-500">
                {t("community.memo", "메모")}
              </Text>
              <Input
                variant="outline"
                size="md"
                className="h-auto items-center border-outline-300 py-2"
              >
                <InputField
                  autoFocus
                  value={memo}
                  onChangeText={setMemo}
                  placeholder={t("community.memo", "메모")}
                  className="text-md min-h-[120px] w-full pl-2 pr-2"
                  multiline
                  textAlignVertical="top"
                />
              </Input>
            </VStack>

            <View className="flex-1 justify-end pb-8">
              <Button
                size="xl"
                variant="solid"
                action="primary"
                className="w-full rounded-2xl"
                isDisabled={!isFormValid || updateMutation.isPending}
                onPress={() => updateMutation.mutate(memo)}
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
