import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// UI components
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const { width } = Dimensions.get("window");

const STEPS = ["name", "birthdate", "phone", "address", "baptism", "welcome"];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    phone: "",
    address: "",
    baptism_status: false,
  });

  const [nameError, setNameError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepId = STEPS[stepIndex];

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      setFormData({ ...formData, birthdate: `${yyyy}-${mm}-${dd}` });
    }
  };

  const handleNext = async () => {
    if (currentStepId === "name" && !formData.name.trim()) {
      setNameError(t("onboarding.name_required", "이름을 입력해주세요."));
      return;
    }
    setNameError("");

    if (currentStepId === "baptism") {
      await saveProfileData();
      setStepIndex(stepIndex + 1);
    } else if (currentStepId === "welcome") {
      useAuthStore.getState().setHasProfile(true);
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleSkip = async () => {
    setNameError("");
    if (currentStepId === "baptism") {
      await saveProfileData();
      setStepIndex(stepIndex + 1);
    } else if (currentStepId === "welcome") {
      useAuthStore.getState().setHasProfile(true);
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0 && currentStepId !== "welcome") {
      setStepIndex(stepIndex - 1);
    }
  };

  const saveProfileData = async () => {
    try {
      setIsSubmitting(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      const updates = {
        id: session.user.id,
        full_name: formData.name,
        birthdate: formData.birthdate || null,
        phone: formData.phone || null,
        address: formData.address || null,
        baptism_status: formData.baptism_status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStepId) {
      case "name":
        return (
          <FormControl isInvalid={!!nameError} className="w-full">
            <FormControlLabel>
              <FormControlLabelText>이름 (필수)</FormControlLabelText>
            </FormControlLabel>
            <Input variant="underlined" size="xl">
              <InputField
                placeholder="홍길동"
                value={formData.name}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, name: text })
                }
                autoComplete="name"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText>{nameError}</FormControlErrorText>
            </FormControlError>
          </FormControl>
        );
      case "birthdate":
        return (
          <FormControl className="w-full">
            {Platform.OS === "android" ? (
              <>
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <Input variant="underlined" size="md" isReadOnly>
                    <InputField
                      placeholder="생년월일 선택"
                      value={formData.birthdate}
                      editable={false}
                    />
                  </Input>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.birthdate
                        ? new Date(formData.birthdate)
                        : new Date(2000, 0, 1)
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            ) : (
              <Box className="mt-4 w-full flex-row justify-center">
                <DateTimePicker
                  value={
                    formData.birthdate
                      ? new Date(formData.birthdate)
                      : new Date(2000, 0, 1)
                  }
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              </Box>
            )}
          </FormControl>
        );
      case "phone":
        return (
          <FormControl className="w-full">
            <FormControlLabel>
              <FormControlLabelText>전화번호 (선택)</FormControlLabelText>
            </FormControlLabel>
            <Input variant="underlined" size="xl">
              <InputField
                placeholder="01012345678"
                value={formData.phone}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />
            </Input>
          </FormControl>
        );
      case "address":
        return (
          <FormControl className="w-full">
            <FormControlLabel>
              <FormControlLabelText>주소 (선택)</FormControlLabelText>
            </FormControlLabel>
            <Input variant="underlined" size="xl">
              <InputField
                placeholder="Fremont"
                value={formData.address}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, address: text })
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>
                빠른 목장 편성을 위해 지역만 입력하셔도 됩니다.
              </FormControlHelperText>
            </FormControlHelper>
          </FormControl>
        );
      case "baptism":
        return (
          <FormControl className="w-full">
            <FormControlLabel>
              <FormControlLabelText>세례 여부 (선택)</FormControlLabelText>
            </FormControlLabel>
            <HStack className="items-center justify-between py-2">
              <Text>세례를 받으셨나요?</Text>
              <Switch
                value={formData.baptism_status}
                onValueChange={(val: boolean) =>
                  setFormData({ ...formData, baptism_status: val })
                }
              />
            </HStack>
          </FormControl>
        );
      case "welcome":
        return (
          <VStack className="items-center justify-center flex-1 mt-10">
            <Box className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-6">
              <Text className="text-4xl">🎉</Text>
            </Box>
            <Text className="text-lg font-base text-center text-gray-800 dark:text-gray-200">
              {formData.name}님, 목장에 오신 것을{"\n"}진심으로 환영합니다.
            </Text>
          </VStack>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStepId) {
      case "name":
        return "환영합니다! 이름을 알려주세요.";
      case "birthdate":
        return "생일이 언제이신가요?";
      case "phone":
        return "연락처를 남겨주세요.";
      case "address":
        return "어디에 거주하시나요?";
      case "baptism":
        return "세례 여부를 알려주세요.";
      case "welcome":
        return "가입 완료!";
      default:
        return "";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <VStack className="flex-1 px-6 pb-4 pt-6">
          {/* 상단 폼 영역 (가변 공간 채움) */}
          <Box className="flex-1">
            <HStack className="mb-8 w-full items-center justify-between">
              {stepIndex > 0 && currentStepId !== "welcome" ? (
                <Pressable onPress={handleBack} disabled={isSubmitting}>
                  <Text className="text-primary-blue font-semibold">
                    뒤로가기
                  </Text>
                </Pressable>
              ) : (
                <Box className="w-16" />
              )}
              
              {currentStepId !== "welcome" ? (
                <Text className="text-gray-500">
                  {stepIndex + 1} / {STEPS.length - 1}
                </Text>
              ) : (
                <Box />
              )}
              
              {currentStepId !== "name" && currentStepId !== "welcome" ? (
                <Pressable onPress={handleSkip} disabled={isSubmitting}>
                  <Text className="font-semibold text-gray-500">건너뛰기</Text>
                </Pressable>
              ) : (
                <Box className="w-16" />
              )}
            </HStack>

            <Box className="relative flex-1 overflow-hidden">
              <AnimatePresence exitBeforeEnter>
                <MotiView
                  key={currentStepId}
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -50 }}
                  transition={{ type: "timing", duration: 300 }}
                  style={{
                    width: "100%",
                    flex: 1,
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  <VStack className={currentStepId === "welcome" ? "gap-2 items-center" : "gap-6"}>
                    <Heading
                      size="xl"
                      className={`leading-tight text-gray-900 dark:text-white ${currentStepId === "welcome" ? "text-center mt-10" : ""}`}
                    >
                      {getStepTitle()}
                    </Heading>
                    {renderStep()}
                  </VStack>
                </MotiView>
              </AnimatePresence>
            </Box>
          </Box>

          <Box className="w-full pt-4">
            <Button
              size="lg"
              className="w-full rounded-xl"
              style={{
                backgroundColor:
                  currentStepId === "name" && !formData.name.trim()
                    ? "#9ca3af"
                    : "#467CFA",
              }}
              onPress={handleNext}
              disabled={(currentStepId === "name" && !formData.name.trim()) || isSubmitting}
            >
              <ButtonText className="font-bold text-white">
                {isSubmitting
                  ? "저장 중..."
                  : currentStepId === "welcome"
                  ? "앱 시작하기"
                  : currentStepId === "baptism"
                  ? "완료"
                  : "다음"}
              </ButtonText>
            </Button>
          </Box>
        </VStack>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
