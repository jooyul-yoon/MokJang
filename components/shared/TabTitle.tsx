import { ReactNode } from "react";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";

export default function TabTitle({
  title,
  className,
  rightElement,
}: {
  title: string;
  className?: string;
  rightElement?: ReactNode;
}) {
  return (
    <HStack className="mb-4 items-center justify-between pt-2">
      <Heading
        size="2xl"
        className={`font-bold tracking-tight text-typography-900 ${className ?? ""}`}
      >
        {title}
      </Heading>
      {rightElement && <HStack className="ml-auto">{rightElement}</HStack>}
    </HStack>
  );
}
