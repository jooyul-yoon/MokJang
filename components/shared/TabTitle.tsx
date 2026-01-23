import { Heading } from "../ui/heading";
import { VStack } from "../ui/vstack";

export default function TabTitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <VStack className="mb-4 px-4">
      <Heading size="2xl" className={className}>
        {title}
      </Heading>
    </VStack>
  );
}
