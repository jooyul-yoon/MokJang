import { Meeting } from "@/types/typeMeeting";
import { Center } from "../ui/center";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

interface UpcomingMeetingProps {
  meetings: Meeting[];
}

export default function UpcomingMeeting({ meetings }: UpcomingMeetingProps) {
  console.log(meetings);
  return meetings.length === 0 ? (
    <Center className="h-[200px]">
      <Text>No meetings found</Text>
    </Center>
  ) : (
    <VStack>
      <Text>UpcomingMeeting</Text>
    </VStack>
  );
}
