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
    <HStack className="my-4 px-4">
      <Heading size="2xl" className={className}>
        {title}
      </Heading>
      {rightElement && <HStack className="ml-auto">{rightElement}</HStack>}
    </HStack>
  );
}
