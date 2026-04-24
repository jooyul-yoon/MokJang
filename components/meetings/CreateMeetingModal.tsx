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
import { useRecentLocations } from "@/hooks/useRecentLocations";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { TFunction } from "i18next";
import {
  AlignLeft,
  Calendar as CalendarIcon,
  Globe,
  Hand,
  MapPin,
  Type,
  Users,
  X,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Dimensions, ScrollView } from "react-native";
import { LocationInput } from "../shared/LocationInput";
import { ModalAvoidKeyboardView } from "../shared/ModalAvoidKeyboardView";

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

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text className="mb-2 text-2xs font-bold uppercase tracking-wider text-typography-500">
    {children}
  </Text>
);

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  t,
  formState,
  onSubmit,
  isSaving,
}) => {
  const { addLocation } = useRecentLocations();
  const { colorScheme } = useColorScheme();

  const handleConfirm = async () => {
    if (!formState.isVolunteerOpen && formState.location) {
      await addLocation(formState.location);
    }
    onSubmit();
  };
  const isDark = colorScheme === "dark";
  const screenHeight = Dimensions.get("window").height;

  const MeetingTypeCard = ({
    isSelected,
    onSelect,
    icon: IconComponent,
    label,
  }: {
    isSelected: boolean;
    onSelect: () => void;
    icon: any;
    label: string;
  }) => (
    <Pressable
      onPress={onSelect}
      className={`flex-1 rounded-xl border p-4 ${
        isSelected
          ? "border-primary-500 bg-primary-50"
          : "border-outline-100 bg-background-0"
      }`}
    >
      <VStack className="items-center gap-2">
        <Icon
          as={IconComponent}
          size="lg"
          className={isSelected ? "text-primary-500" : "text-typography-400"}
        />
        <Text
          size="sm"
          className={`font-semibold tracking-tight ${
            isSelected ? "text-primary-700" : "text-typography-600"
          }`}
        >
          {label}
        </Text>
      </VStack>
    </Pressable>
  );

  const isConfirmDisabled =
    isSaving ||
    (formState.type === "general" && !formState.title) ||
    (!formState.isVolunteerOpen && !formState.location);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalAvoidKeyboardView>
        <ModalContent
          className="shadow-card w-full max-w-[360px] overflow-hidden rounded-2xl border-0 bg-background-50 p-0"
          style={{ height: screenHeight * 0.78 }}
        >
          {/* Header */}
          <ModalHeader className="items-center border-b border-outline-100 bg-background-0 px-5 py-4">
            <Heading
              size="lg"
              className="font-bold tracking-tight text-typography-900"
            >
              {t("community.addMeeting")}
            </Heading>
            <ModalCloseButton>
              <Icon as={X} size="md" className="text-typography-500" />
            </ModalCloseButton>
          </ModalHeader>

          {/* Body */}
          <ModalBody className="flex-1 bg-background-50 p-0">
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
            >
              <VStack className="gap-5">
                {/* Meeting type */}
                <VStack>
                  <SectionLabel>
                    {t("community.meetingType", { defaultValue: "Type" })}
                  </SectionLabel>
                  <HStack space="sm" className="w-full">
                    <MeetingTypeCard
                      isSelected={formState.type === "mokjang"}
                      onSelect={() => formState.setType("mokjang")}
                      icon={Users}
                      label={t("community.mokjangMeeting")}
                    />
                    <MeetingTypeCard
                      isSelected={formState.type === "general"}
                      onSelect={() => formState.setType("general")}
                      icon={Globe}
                      label={t("community.generalMeeting")}
                    />
                  </HStack>
                </VStack>

                {/* Title (general only) */}
                {formState.type === "general" && (
                  <FormControl isRequired>
                    <SectionLabel>
                      {t("community.title", { defaultValue: "Title" })}
                    </SectionLabel>
                    <Input
                      size="md"
                      variant="outline"
                      className="h-12 rounded-lg border-0 bg-background-0 px-1"
                    >
                      <InputSlot className="pl-3">
                        <InputIcon
                          as={Type}
                          className="text-typography-500"
                          size="sm"
                        />
                      </InputSlot>
                      <InputField
                        className="text-base text-typography-900"
                        value={formState.title}
                        onChangeText={formState.setTitle}
                        placeholder={t("community.enterTitle")}
                        placeholderTextColor={isDark ? "#6B7280" : "#C4CAD4"}
                      />
                    </Input>
                  </FormControl>
                )}

                {/* When */}
                <VStack>
                  <SectionLabel>
                    {t("community.when", { defaultValue: "When" })}
                  </SectionLabel>
                  <HStack className="h-12 items-center justify-between rounded-lg bg-background-0 px-3">
                    <HStack className="items-center gap-2">
                      <Icon
                        as={CalendarIcon}
                        size="sm"
                        className="text-typography-500"
                      />
                      <Text className="text-sm text-typography-700">
                        {t("community.dateTime", {
                          defaultValue: "Date & time",
                        })}
                      </Text>
                    </HStack>
                    <RNDateTimePicker
                      value={formState.date}
                      mode="datetime"
                      display="default"
                      minuteInterval={15}
                      onChange={(_, d) => d && formState.setDate(d)}
                      themeVariant={colorScheme}
                      style={{
                        transform: [{ scale: 0.85 }, { translateX: 8 }],
                      }}
                    />
                  </HStack>
                </VStack>

                {/* Where */}
                <VStack>
                  <SectionLabel>
                    {t("community.where", { defaultValue: "Where" })}
                  </SectionLabel>

                  {/* Volunteer toggle row — always visible */}
                  <HStack className="mb-2 h-12 items-center justify-between rounded-lg bg-background-0 px-3">
                    <HStack className="items-center gap-2">
                      <Icon
                        as={Hand}
                        size="sm"
                        className="text-typography-500"
                      />
                      <Text className="text-sm text-typography-700">
                        {t("community.volunteerAvailable")}
                      </Text>
                    </HStack>
                    <Switch
                      value={formState.isVolunteerOpen}
                      onValueChange={formState.setIsVolunteerOpen}
                      trackColor={{ false: "#E0E3E8", true: "#467CFA" }}
                      thumbColor="#FFFFFF"
                      style={{
                        transform: [{ scale: 0.85 }],
                      }}
                    />
                  </HStack>

                  {/* Location input — hidden when volunteer toggle is on */}
                  {!formState.isVolunteerOpen && (
                    <FormControl isRequired className="z-[100]">
                      <LocationInput
                        size="md"
                        className="h-12 rounded-lg border-0 bg-background-0 px-1"
                        icon={MapPin}
                        value={formState.location}
                        onChangeText={formState.setLocation}
                        placeholder={t("community.locationPlaceholder")}
                        inputFieldClassName="text-base text-typography-900"
                      />
                    </FormControl>
                  )}
                </VStack>

                {/* Memo */}
                <VStack className="z-[0]">
                  <SectionLabel>
                    {t("community.memo", { defaultValue: "Notes" })}
                  </SectionLabel>
                  <Input
                    size="md"
                    variant="outline"
                    className="h-24 rounded-lg border-0 bg-background-0 px-1"
                  >
                    <InputSlot className="self-start pl-3 pt-3">
                      <InputIcon
                        as={AlignLeft}
                        className="text-typography-500"
                        size="sm"
                      />
                    </InputSlot>
                    <InputField
                      className="pt-2.5 text-base text-typography-900"
                      value={formState.memo}
                      onChangeText={formState.setMemo}
                      placeholder={t("community.enterMemo")}
                      placeholderTextColor={isDark ? "#6B7280" : "#C4CAD4"}
                      multiline
                      textAlignVertical="top"
                      numberOfLines={4}
                    />
                  </Input>
                </VStack>
              </VStack>
            </ScrollView>
          </ModalBody>

          {/* Footer */}
          <ModalFooter className="gap-2 border-t border-outline-100 bg-background-0 px-5 py-3">
            <Button
              variant="outline"
              action="secondary"
              size="md"
              onPress={onClose}
              className="h-12 flex-1 rounded-lg border border-outline-200 bg-transparent"
            >
              <ButtonText className="text-base font-semibold text-typography-600">
                {t("common.cancel")}
              </ButtonText>
            </Button>
            <Button
              size="md"
              onPress={handleConfirm}
              className="h-12 flex-1 rounded-lg bg-primary-500 active:bg-primary-700 disabled:opacity-50"
              isDisabled={isConfirmDisabled}
            >
              <ButtonText className="text-base font-bold text-white">
                {isSaving ? t("common.saving") : t("common.confirm")}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalAvoidKeyboardView>
    </Modal>
  );
};
