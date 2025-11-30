import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { joinGroup } from "@/services/api";

interface Group {
  id: string;
  name: string;
  description: string;
  meeting_time: string;
  meeting_location: string;
}

interface GroupListProps {
  groups: Group[];
}

export default function GroupList({ groups }: GroupListProps) {
  const toast = useToast();

  const handleJoinRequest = async (groupId: string) => {
    const { success, error } = await joinGroup(groupId);

    if (!success) {
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="error" variant="solid">
              <VStack space="xs">
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>
                  {error || "Failed to send join request."}
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } else {
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="success" variant="solid">
              <VStack space="xs">
                <ToastTitle>Success</ToastTitle>
                <ToastDescription>
                  Join request sent successfully!
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    }
  };

  return (
    <VStack className="mt-6 gap-4">
      <Heading
        size="md"
        className="mb-2 text-typography-black dark:text-typography-white"
      >
        Explore MokJangs
      </Heading>
      {groups.map((group) => (
        <Card
          key={group.id}
          className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
        >
          <VStack className="gap-2">
            <Text className="text-lg font-bold text-typography-black dark:text-typography-white">
              {group.name}
            </Text>
            <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
              {group.description}
            </Text>
            <VStack className="mt-2">
              <Text className="text-typography-gray-500 text-xs">
                🕒 {group.meeting_time}
              </Text>
              <Text className="text-typography-gray-500 text-xs">
                📍 {group.meeting_location}
              </Text>
            </VStack>
            <Button
              onPress={() => handleJoinRequest(group.id)}
              size="sm"
              action="primary"
              className="mt-2 self-start"
            >
              <ButtonText>Request to Join</ButtonText>
            </Button>
          </VStack>
        </Card>
      ))}
    </VStack>
  );
}
