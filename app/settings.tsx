import { GoBackHeader } from "@/components/GoBackHeader";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import i18n from "@/i18n";
import { supabase } from "@/lib/supabase";
import { deleteAccount } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem("language", lang);
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />
      <GoBackHeader title={t("common.settings")} />
      <ScrollView className="flex-1 p-4">
        <VStack className="mb-8">
          <Text className="mb-2 text-lg font-semibold text-typography-black dark:text-typography-white">
            {t("common.language")}
          </Text>

          <HStack className="gap-4">
            <Button
              onPress={() => changeLanguage("ko")}
              action={i18n.language === "ko" ? "primary" : "secondary"}
              variant={i18n.language === "ko" ? "solid" : "outline"}
              className="flex-1"
            >
              <ButtonText>{t("common.korean")}</ButtonText>
            </Button>

            <Button
              onPress={() => changeLanguage("en")}
              action={i18n.language === "en" ? "primary" : "secondary"}
              variant={i18n.language === "en" ? "solid" : "outline"}
              className="flex-1"
            >
              <ButtonText>{t("common.english")}</ButtonText>
            </Button>
          </HStack>
        </VStack>

        <VStack className="mb-4">
          <Text className="mb-2 text-lg font-semibold text-typography-black dark:text-typography-white">
            {t("common.theme")}
          </Text>

          <HStack className="gap-2">
            {(["light", "dark", "system"] as const).map((mode) => (
              <Button
                key={mode}
                onPress={() => setColorScheme(mode)}
                action={colorScheme === mode ? "primary" : "secondary"}
                variant={colorScheme === mode ? "solid" : "outline"}
                className="flex-1"
              >
                <ButtonText>{t(`common.${mode}`)}</ButtonText>
              </Button>
            ))}
          </HStack>
        </VStack>

        <Button
          onPress={() => supabase.auth.signOut()}
          action="negative"
          variant="outline"
          className="mb-8 mt-4"
        >
          <ButtonText>{t("profile.signOut")}</ButtonText>
        </Button>

        <Button
          onPress={() => setShowDeleteModal(true)}
          action="negative"
          variant="solid"
          className="mb-8"
        >
          <ButtonText>{t("common.deleteAccount")}</ButtonText>
        </Button>
      </ScrollView>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" className="text-typography-900">
              {t("common.deleteAccount")}
            </Heading>
            <ModalCloseButton>
              <Icon as={X} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text size="sm" className="text-typography-500">
              {t("common.deleteAccountConfirmation")}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowDeleteModal(false)}
            >
              <ButtonText>{t("common.cancel")}</ButtonText>
            </Button>
            <Button
              onPress={async () => {
                const { success, error } = await deleteAccount();
                if (success) {
                  setShowDeleteModal(false);
                  router.replace("/");
                } else {
                  console.error(error);
                  // Optionally show error toast
                }
              }}
              action="negative"
            >
              <ButtonText>{t("common.delete")}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
