import { Button, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";

interface GoBackHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export function GoBackHeader({ title, rightElement }: GoBackHeaderProps) {
  const router = useRouter();

  return (
    <HStack className="items-center border-b border-outline-100 p-4">
      <Button
        variant="link"
        onPress={() => router.back()}
        className="mr-4 p-0"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ButtonIcon as={ArrowLeft} size="xl" className="text-typography-900" />
      </Button>
      <Heading size="lg" className="text-typography-900">
        {title}
      </Heading>
      {rightElement && (
        <HStack className="ml-auto items-center">{rightElement}</HStack>
      )}
    </HStack>
  );
}
