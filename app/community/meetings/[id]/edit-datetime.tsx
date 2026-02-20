import { GoBackHeader } from "@/components/GoBackHeader";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchMeetingById, updateMeeting } from "@/services/MeetingApi";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditDateTimeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();

  const [date, setDate] = useState<Date>(new Date());

  const { data: meeting, isLoading } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => fetchMeetingById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (meeting?.meeting_time) {
      setDate(new Date(meeting.meeting_time));
    }
  }, [meeting]);

  const updateMutation = useMutation({
    mutationFn: (newDate: Date) =>
      updateMeeting(id, { meeting_time: newDate.toISOString() }),
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <GoBackHeader title="" />
      <VStack className="flex-1 px-4 pt-4">
        <Text className="mb-8 text-2xl font-bold text-typography-900">
          {t("community.enterDateTime", "모임 일시를 선택해주세요")}
        </Text>

        <Center className="-mt-20 flex-1">
          <RNDateTimePicker
            value={date}
            mode="datetime"
            display="inline"
            minuteInterval={15}
            onChange={(_, d) => d && setDate(d)}
            themeVariant={colorScheme}
          />
        </Center>

        <View className="justify-end pb-8">
          <Button
            size="xl"
            variant="solid"
            action="primary"
            className="w-full rounded-2xl"
            isDisabled={updateMutation.isPending}
            onPress={() => updateMutation.mutate(date)}
          >
            {updateMutation.isPending && (
              <ButtonSpinner color="white" className="mr-2" />
            )}
            <ButtonText>{t("common.next", "다음")}</ButtonText>
          </Button>
        </View>
      </VStack>
    </SafeAreaView>
  );
}
