import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import { ArrowLeft, LucideIcon } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

interface GoBackHeaderProps {
  GoBackIcon?: LucideIcon;
  title: string;
  rightElement?: React.ReactNode;
}

export function GoBackHeader({
  GoBackIcon,
  title,
  rightElement,
}: GoBackHeaderProps) {
  const router = useRouter();

  return (
    <HStack className="items-center justify-between border-b border-outline-50 p-4 py-2">
      <HStack className="items-center justify-start ">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon as={GoBackIcon ? GoBackIcon : ArrowLeft} size="md" />
        </TouchableOpacity>
      </HStack>
      <HStack className="max-w-[300px] items-center justify-center">
        <Text numberOfLines={1} className="text-typography-950" size="md">
          {title}
        </Text>
      </HStack>
      <HStack className="items-center justify-end">{rightElement}</HStack>
    </HStack>
  );
}
