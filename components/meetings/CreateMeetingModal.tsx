import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { TFunction } from "i18next";
import {
  AlignLeft,
  Calendar as CalendarIcon,
  Globe,
  MapPin,
  Type,
  Users,
  X,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TFunction;
  formState: {
    type: "mokjang" | "general";
    setType: (val: "mokjang" | "general") => void;
    title: string;
    setTitle: (val: string) => void;
    date: Date;
    setDate: (val: Date) => void;
    isVolunteerOpen: boolean;
    setIsVolunteerOpen: (val: boolean) => void;
    location: string;
    setLocation: (val: string) => void;
    memo: string;
    setMemo: (val: string) => void;
  };
  onSubmit: () => void;
  isSaving: boolean;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  t,
  formState,
  onSubmit,
  isSaving,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const screenHeight = Dimensions.get("window").height;

  const MeetingTypeCard = ({
    type,
    isSelected,
    onSelect,
    icon: IconComponent,
    label,
  }: {
    type: "mokjang" | "general";
    isSelected: boolean;
    onSelect: () => void;
    icon: any;
    label: string;
  }) => (
    <Pressable
      onPress={onSelect}
      className={`flex-1 rounded-xl border p-3 ${
        isSelected
          ? isDark
            ? "border-primary-400 bg-primary-900/30"
            : "border-primary-500 bg-primary-50"
          : isDark
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gray-50"
      }`}
    >
      <VStack className="items-center space-y-1">
        <Icon
          as={IconComponent}
          size="lg"
          className={isSelected ? "text-primary-500" : "text-gray-400"}
        />
        <Text
          size="sm"
          className={`font-medium ${isSelected ? "text-primary-500" : "text-gray-500"}`}
        >
          {label}
        </Text>
      </VStack>
    </Pressable>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
        pointerEvents="box-none"
      >
        <ModalContent
          className="w-full max-w-[340px] overflow-hidden p-2"
          style={{ height: screenHeight * 0.5 }}
        >
          <ModalHeader className="min-h-0 border-b border-gray-100 py-2 dark:border-gray-800">
            <Heading size="sm" className="text-gray-900 dark:text-gray-100">
              {t("community.addMeeting")}
            </Heading>
            <ModalCloseButton>
              <Icon as={X} size="sm" className="text-gray-500" />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody className="flex-1 p-0">
            <ScrollView
              contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
              showsVerticalScrollIndicator={true}
            >
              <VStack className="gap-3">
                {/* Meeting Type Selection */}
                <FormControl>
                  <HStack space="sm" className="w-full">
                    <MeetingTypeCard
                      type="mokjang"
                      isSelected={formState.type === "mokjang"}
                      onSelect={() => formState.setType("mokjang")}
                      icon={Users}
                      label={t("community.mokjangMeeting")}
                    />
                    <MeetingTypeCard
                      type="general"
                      isSelected={formState.type === "general"}
                      onSelect={() => formState.setType("general")}
                      icon={Globe}
                      label={t("community.generalMeeting")}
                    />
                  </HStack>
                </FormControl>

                {/* Title Input (Conditional) */}
                {formState.type === "general" && (
                  <FormControl isRequired={true}>
                    <Input
                      size="sm"
                      className="h-12 rounded-md border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <InputSlot className="pl-2">
                        <InputIcon
                          as={Type}
                          className="text-gray-400"
                          size="sm"
                        />
                      </InputSlot>
                      <InputField
                        className="py-0 text-sm"
                        value={formState.title}
                        onChangeText={formState.setTitle}
                        placeholder={t("community.enterTitle")}
                      />
                    </Input>
                  </FormControl>
                )}

                {/* Date Selection */}
                <FormControl>
                  <HStack className="h-12 items-center justify-between rounded-md border border-gray-300 bg-gray-50 pl-2 dark:border-gray-700 dark:bg-gray-800">
                    <Icon
                      as={CalendarIcon}
                      size="sm"
                      className="text-gray-400"
                    />
                    <RNDateTimePicker
                      value={formState.date}
                      mode="datetime"
                      display="default"
                      minuteInterval={15}
                      onChange={(_, d) => d && formState.setDate(d)}
                      themeVariant={colorScheme}
                      style={{
                        transform: [{ scale: 0.8 }, { translateX: 10 }],
                      }}
                    />
                  </HStack>
                </FormControl>

                {/* Location Input & Volunteer Toggle Row */}
                <HStack space="sm" className="items-center justify-end">
                  {!formState.isVolunteerOpen && (
                    <FormControl className="flex-1" isRequired={true}>
                      <Input
                        size="sm"
                        className="h-12 rounded-md border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <InputSlot className="pl-2">
                          <InputIcon
                            as={MapPin}
                            className="text-gray-400"
                            size="sm"
                          />
                        </InputSlot>
                        <InputField
                          className="py-0 text-sm"
                          value={formState.location}
                          onChangeText={formState.setLocation}
                          placeholder={t("community.locationPlaceholder")}
                          accessibilityLanguage="ko"
                        />
                      </Input>
                    </FormControl>
                  )}

                  <HStack className="h-12 items-center rounded-md border border-gray-300 bg-gray-50 px-2 dark:border-gray-700 dark:bg-gray-800">
                    <Text
                      size="sm"
                      className="mr-2 text-typography-500 dark:text-gray-300"
                    >
                      {t("community.volunteerAvailable").split(" ")[0]}
                    </Text>
                    <VStack className="justify-center">
                      <Switch
                        value={formState.isVolunteerOpen}
                        onValueChange={formState.setIsVolunteerOpen}
                        trackColor={{ false: "#767577", true: "#0a7ea4" }}
                        style={{
                          transform: [{ scale: 0.8 }],
                        }}
                      />
                    </VStack>
                  </HStack>
                </HStack>

                {/* Memo Input */}
                <FormControl>
                  <Input
                    size="sm"
                    className="h-14 rounded-md border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <InputSlot className="self-start pl-2 pt-2">
                      <InputIcon
                        as={AlignLeft}
                        className="text-gray-400"
                        size="sm"
                      />
                    </InputSlot>
                    <InputField
                      className="pt-1.5 text-sm"
                      value={formState.memo}
                      onChangeText={formState.setMemo}
                      placeholder={t("community.enterMemo")}
                      multiline={true}
                      textAlignVertical="top"
                      numberOfLines={4}
                    />
                  </Input>
                </FormControl>
              </VStack>
            </ScrollView>
          </ModalBody>
          <ModalFooter className="border-t border-gray-100 pt-3 dark:border-gray-800">
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={onClose}
              className="mr-2 flex-1 border-gray-300 dark:border-gray-600"
            >
              <ButtonText className="font-medium text-gray-600 dark:text-gray-300">
                {t("common.cancel")}
              </ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={onSubmit}
              className="flex-1 rounded-md bg-primary-500 shadow-sm hover:bg-primary-600"
              isDisabled={
                isSaving ||
                (formState.type === "general" && !formState.title) ||
                (!formState.isVolunteerOpen && !formState.location)
              }
            >
              <ButtonText className="font-bold text-white">
                {isSaving ? t("common.saving") : t("common.confirm")}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </KeyboardAvoidingView>
    </Modal>
  );
};
