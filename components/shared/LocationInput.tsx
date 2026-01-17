import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useRecentLocations } from "@/hooks/useRecentLocations";
import { History } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { Pressable } from "../ui/pressable";
import { VStack } from "../ui/vstack";

interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: any;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string; // For the Input container
  inputFieldClassName?: string;
  isDisabled?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  placeholder,
  icon,
  size = "md",
  className,
  inputFieldClassName,
  isDisabled,
}) => {
  const { locations } = useRecentLocations();
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return locations;
    return locations.filter(
      (l) => l.toLowerCase().includes(trimmed) && l !== value,
    );
  }, [locations, value]);

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <VStack className="relative z-10 w-full">
      <Input size={size} className={className} isDisabled={isDisabled}>
        {icon && (
          <InputSlot className="pl-2">
            <InputIcon as={icon} className="text-gray-400" size="sm" />
          </InputSlot>
        )}
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Small delay to allow press on suggestion to register
            setTimeout(() => setIsFocused(false), 200);
          }}
          className={inputFieldClassName}
          autoCapitalize="none"
        />
      </Input>

      {showSuggestions && (
        <ScrollView className="absolute top-14 max-h-[80px] w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {suggestions.map((loc, index) => (
            <Pressable
              key={index}
              className={`flex-row items-center border-b border-gray-100 px-3 py-2.5 active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-800 ${
                index === suggestions.length - 1 ? "border-b-0" : ""
              }`}
              onPress={() => {
                onChangeText(loc);
                setIsFocused(false);
              }}
            >
              <Icon as={History} size="xs" className="mr-2 text-gray-400" />
              <Text size="sm" className="text-gray-700 dark:text-gray-300">
                {loc}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </VStack>
  );
};
