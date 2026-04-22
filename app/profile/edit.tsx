import { supabase } from "@/lib/supabase";
import { fetchUserProfile } from "@/services/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoBackHeader } from "@/components/GoBackHeader";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    phone: "",
    address: "",
    baptism_status: false,
  });

  const [nameError, setNameError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.full_name || "",
        birthdate: profile.birthdate || "",
        phone: profile.phone || "",
        address: profile.address || "",
        baptism_status: !!profile.baptism_status,
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const updates = {
        id: session.user.id,
        full_name: data.name,
        birthdate: data.birthdate || null,
        phone: data.phone || null,
        address: data.address || null,
        baptism_status: data.baptism_status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      router.back();
    },
  });

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

  const handleSave = () => {
    if (!formData.name.trim()) {
      setNameError(t("profile.nameRequiredError"));
      return;
    }
    setNameError("");
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <SafeAreaView className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <GoBackHeader 
          title={t("profile.editProfile")} 
          rightElement={
            <Button
              size="sm"
              variant="link"
              onPress={handleSave}
              disabled={!formData.name.trim() || updateProfileMutation.isPending}
            >
              <ButtonText className="text-primary-blue font-semibold text-base">
                {updateProfileMutation.isPending ? t("common.saving") : t("profile.save")}
              </ButtonText>
            </Button>
          }
        />
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <VStack className="gap-8 pb-10">
            <FormControl isInvalid={!!nameError} className="w-full">
              <FormControlLabel>
                <FormControlLabelText>{t("profile.nameRequired")}</FormControlLabelText>
              </FormControlLabel>
              <Input variant="underlined" size="xl">
                <InputField
                  placeholder={t("profile.nameInputPlaceholder")}
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

            <FormControl className="w-full">
              <FormControlLabel>
                <FormControlLabelText>{t("profile.birthdate")}</FormControlLabelText>
              </FormControlLabel>
              {Platform.OS === "android" ? (
                <>
                  <Pressable onPress={() => setShowDatePicker(true)}>
                    <Input variant="underlined" size="xl" isReadOnly>
                      <InputField
                        placeholder={t("profile.birthdatePlaceholder")}
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
                <Box className="mt-4 w-full flex-row justify-start">
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
                </Box>
              )}
            </FormControl>

            <FormControl className="w-full">
              <FormControlLabel>
                <FormControlLabelText>{t("profile.phone")}</FormControlLabelText>
              </FormControlLabel>
              <Input variant="underlined" size="xl">
                <InputField
                  placeholder={t("profile.phonePlaceholder")}
                  value={formData.phone}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, phone: text })
                  }
                  keyboardType="phone-pad"
                />
              </Input>
            </FormControl>

            <FormControl className="w-full">
              <FormControlLabel>
                <FormControlLabelText>{t("profile.address")}</FormControlLabelText>
              </FormControlLabel>
              <Input variant="underlined" size="xl">
                <InputField
                  placeholder={t("profile.addressPlaceholder")}
                  value={formData.address}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, address: text })
                  }
                />
              </Input>
            </FormControl>

            <FormControl className="mb-2 w-full">
              <HStack className="items-center justify-between py-2">
                <Text className="font-medium text-typography-900">
                  {t("profile.baptismQuestion")}
                </Text>
                <Switch
                  value={formData.baptism_status}
                  onValueChange={(val: boolean) =>
                    setFormData({ ...formData, baptism_status: val })
                  }
                />
              </HStack>
            </FormControl>

            <Button
              size="lg"
              className="bg-primary-blue mt-4 w-full rounded-xl"
              onPress={handleSave}
              disabled={
                !formData.name.trim() || updateProfileMutation.isPending
              }
            >
              <ButtonText className="font-bold text-white">
                {updateProfileMutation.isPending ? t("common.saving") : t("profile.save")}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
