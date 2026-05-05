import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import {
  clearPendingAppleFullName,
  getAuthMetadataName,
  getPendingAppleFullName,
  isAppleAuthUser,
} from "@/utils/auth-profile";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const STEPS = ["name", "birthdate", "phone", "address", "baptism", "welcome"];
const APPLE_NAME_FALLBACK = "Apple User";

const formatBirthdateInput = (text: string) =>
  text.replace(/\D/g, "").slice(0, 6);

const parseBirthdateInput = (value: string) => {
  const digits = formatBirthdateInput(value);
  if (!digits) return null;
  if (digits.length !== 6) return undefined;

  const yy = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  const currentYear = new Date().getFullYear();
  const currentYearShort = currentYear % 100;
  const year = yy > currentYearShort ? 1900 + yy : 2000 + yy;
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > new Date()
  ) {
    return undefined;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
};

export default function OnboardingScreen() {
  const { t } = useTranslation();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    phone: "",
    address: "",
    baptism_status: false,
  });

  const [nameError, setNameError] = useState("");
  const [birthdateError, setBirthdateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldSkipNameStep, setShouldSkipNameStep] = useState(false);

  const currentStepId = STEPS[stepIndex];
  const firstStepIndex = shouldSkipNameStep ? 1 : 0;
  const formStepTotal = shouldSkipNameStep
    ? STEPS.length - 2
    : STEPS.length - 1;
  const formStepNumber = shouldSkipNameStep ? stepIndex : stepIndex + 1;
  const canGoBack = currentStepId !== "welcome" && stepIndex > firstStepIndex;

  useEffect(() => {
    let active = true;

    const hydrateKnownProfileName = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        const isAppleUser = isAppleAuthUser(session.user);
        const pendingAppleName = isAppleUser
          ? await getPendingAppleFullName(session.user.id)
          : null;
        const resolvedName =
          profile?.full_name?.trim() ||
          pendingAppleName ||
          getAuthMetadataName(session.user) ||
          (isAppleUser ? APPLE_NAME_FALLBACK : null);

        if (!active) return;

        if (resolvedName) {
          setFormData((previous) => ({
            ...previous,
            name: resolvedName,
          }));
          setShouldSkipNameStep(true);
          setStepIndex((previous) => (previous === 0 ? 1 : previous));
        }
      } catch (error) {
        console.error("Error hydrating onboarding profile:", error);
      } finally {
        if (active) setIsInitializing(false);
      }
    };

    hydrateKnownProfileName();

    return () => {
      active = false;
    };
  }, []);

  const handleNext = async () => {
    if (currentStepId === "name" && !formData.name.trim()) {
      setNameError(t("onboarding.name_required", "이름을 입력해주세요."));
      return;
    }
    setNameError("");

    if (
      currentStepId === "birthdate" &&
      parseBirthdateInput(formData.birthdate) === undefined
    ) {
      setBirthdateError("YYMMDD 형식으로 정확히 입력해주세요.");
      return;
    }
    setBirthdateError("");

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
    setBirthdateError("");
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
    if (canGoBack) {
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
        full_name: formData.name.trim(),
        birthdate: parseBirthdateInput(formData.birthdate) ?? null,
        phone: formData.phone || null,
        address: formData.address || null,
        baptism_status: formData.baptism_status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      if (isAppleAuthUser(session.user)) {
        await clearPendingAppleFullName(session.user.id);
      }
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
          <FormControl isInvalid={!!birthdateError} className="w-full">
            <FormControlLabel>
              <FormControlLabelText>생년월일 (선택)</FormControlLabelText>
            </FormControlLabel>
            <Input variant="underlined" size="xl">
              <InputField
                placeholder="YYMMDD"
                value={formData.birthdate}
                onChangeText={(text: string) => {
                  setBirthdateError("");
                  setFormData({
                    ...formData,
                    birthdate: formatBirthdateInput(text),
                  });
                }}
                keyboardType="number-pad"
                maxLength={6}
                className="text-3xl font-bold tracking-[0px]"
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>
                예: 970415처럼 숫자 6자리만 입력해주세요.
              </FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorText>{birthdateError}</FormControlErrorText>
            </FormControlError>
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
                placeholder="1234567890"
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
              <FormControlLabelText>지역 (선택)</FormControlLabelText>
            </FormControlLabel>
            <Input variant="underlined" size="xl">
              <InputField
                placeholder="Mountain View"
                value={formData.address}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, address: text })
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>
                자세한 주소는 입력하지 않으셔도 됩니다.
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
          <VStack className="mt-10 flex-1 items-center justify-center">
            <Box className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary-100">
              <Text className="text-4xl">🎉</Text>
            </Box>
            <Text className="text-center text-lg font-medium text-typography-900">
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

  if (isInitializing) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-50">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-50"
    >
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <VStack className="flex-1 px-6 pb-4 pt-6">
          {/* 상단 폼 영역 (가변 공간 채움) */}
          <Box className="flex-1">
            <HStack className="mb-8 w-full items-center justify-between">
              {canGoBack ? (
                <Pressable onPress={handleBack} disabled={isSubmitting}>
                  <Text className="font-semibold text-primary-500">
                    뒤로가기
                  </Text>
                </Pressable>
              ) : (
                <Box className="w-16" />
              )}

              {currentStepId !== "welcome" ? (
                <Text className="text-typography-400">
                  {formStepNumber} / {formStepTotal}
                </Text>
              ) : (
                <Box />
              )}

              {currentStepId !== "name" && currentStepId !== "welcome" ? (
                <Pressable onPress={handleSkip} disabled={isSubmitting}>
                  <Text className="font-semibold text-typography-400">
                    건너뛰기
                  </Text>
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
                  <VStack
                    className={
                      currentStepId === "welcome"
                        ? "items-center gap-2"
                        : "gap-6"
                    }
                  >
                    <Heading
                      size="xl"
                      className={`leading-tight text-typography-900 ${currentStepId === "welcome" ? "mt-10 text-center" : ""}`}
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
              disabled={
                (currentStepId === "name" && !formData.name.trim()) ||
                isSubmitting
              }
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
