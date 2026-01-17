import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
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
import { useRecentLocations } from "@/hooks/useRecentLocations";
import { TFunction } from "i18next";
import { MapPin, X } from "lucide-react-native";
import React from "react";
import { LocationInput } from "../shared/LocationInput";
import { ModalAvoidKeyboardView } from "../shared/ModalAvoidKeyboardView";

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TFunction;
  locationInput: string;
  setLocationInput: (val: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({
  isOpen,
  onClose,
  t,
  locationInput,
  setLocationInput,
  onSubmit,
  isSaving,
}) => {
  const { addLocation } = useRecentLocations();

  const handleConfirm = async () => {
    if (locationInput) {
      await addLocation(locationInput);
    }
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalAvoidKeyboardView>
        <ModalContent className={`h-[360px]`}>
          <ModalHeader>
            <Heading size="lg">{t("community.volunteerTitle")}</Heading>
            <ModalCloseButton>
              <Icon as={X} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack className="gap-4 py-4">
              <Text>{t("community.volunteerDescription")}</Text>
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText>
                    {t("community.enterLocation")}
                  </FormControlLabelText>
                </FormControlLabel>
                <LocationInput
                  size="sm"
                  className="h-12 rounded-md border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  icon={MapPin}
                  value={locationInput}
                  onChangeText={setLocationInput}
                  placeholder={t("community.locationPlaceholder")}
                  inputFieldClassName="py-0 text-sm"
                />
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
            <Button
              onPress={handleConfirm}
              isDisabled={isSaving || !locationInput}
            >
              <ButtonText>
                {isSaving ? t("common.saving") : t("common.confirm")}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalAvoidKeyboardView>
    </Modal>
  );
};
