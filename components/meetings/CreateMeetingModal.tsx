import { Button, ButtonText } from "@/components/ui/button";
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@/components/ui/modal";
import {
    Radio,
    RadioGroup,
    RadioIcon,
    RadioIndicator,
    RadioLabel,
} from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { TFunction } from "i18next";
import { CircleIcon, X } from "lucide-react-native";
import React from "react";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{t("community.addMeeting")}</Heading>
          <ModalCloseButton>
            <Icon as={X} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack className="gap-4 py-4">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>
                  {t("community.meetingType")}
                </FormControlLabelText>
              </FormControlLabel>
              <RadioGroup
                value={formState.type}
                onChange={(val) =>
                  formState.setType(val as "mokjang" | "general")
                }
              >
                <HStack space="md">
                  <Radio value="mokjang" size="md">
                    <RadioIndicator>
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                    <RadioLabel>{t("community.mokjangMeeting")}</RadioLabel>
                  </Radio>
                  <Radio value="general" size="md">
                    <RadioIndicator>
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                    <RadioLabel>{t("community.generalMeeting")}</RadioLabel>
                  </Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            {formState.type === "general" && (
              <FormControl isRequired={true}>
                <FormControlLabel>
                  <FormControlLabelText>{t("common.title")}</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    value={formState.title}
                    onChangeText={formState.setTitle}
                    placeholder={t("community.enterTitle")}
                  />
                </Input>
              </FormControl>
            )}

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>
                  {t("community.selectTime")}
                </FormControlLabelText>
              </FormControlLabel>
              <HStack>
                <RNDateTimePicker
                  value={formState.date}
                  mode="datetime"
                  display="default"
                  themeVariant="light"
                  minuteInterval={15}
                  onChange={(_, d) => d && formState.setDate(d)}
                />
              </HStack>
            </FormControl>

            <HStack className="items-center justify-between">
              <Text>{t("community.volunteerAvailable")}</Text>
              <Switch
                value={formState.isVolunteerOpen}
                onValueChange={formState.setIsVolunteerOpen}
              />
            </HStack>

            {!formState.isVolunteerOpen && (
              <FormControl isRequired={true}>
                <FormControlLabel>
                  <FormControlLabelText>
                    {t("community.enterLocation")}
                  </FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    value={formState.location}
                    onChangeText={formState.setLocation}
                    placeholder={t("community.locationPlaceholder")}
                  />
                </Input>
              </FormControl>
            )}

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>{t("community.memo")}</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  value={formState.memo}
                  onChangeText={formState.setMemo}
                  placeholder={t("community.enterMemo")}
                />
              </Input>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            className="mr-2"
          >
            <ButtonText>{t("common.cancel")}</ButtonText>
          </Button>
          <Button onPress={onSubmit} isDisabled={isSaving || (formState.type === 'general' && !formState.title)}>
            <ButtonText>
              {isSaving ? t("common.saving") : t("common.confirm")}
            </ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
