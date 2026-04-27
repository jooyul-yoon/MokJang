import { fetchGroupMembers } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

interface GroupMembersFacepileProps {
  groupId: string;
  max?: number;
}

export function GroupMembersFacepile({
  groupId,
  max = 4,
}: GroupMembersFacepileProps) {
  const { data: members, isLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => fetchGroupMembers(groupId),
  });

  if (isLoading || !members || members.length === 0) {
    return <HStack className="h-8 items-center" />;
  }

  const displayMembers = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <HStack className="items-center gap-0">
      {displayMembers.map((m, i) => {
        const name = m.profiles?.full_name || "?";
        const initial = name.charAt(0);
        return (
          <VStack
            key={m.user_id}
            className="h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-500"
            style={{
              marginLeft: i === 0 ? 0 : -8,
              zIndex: displayMembers.length - i,
            }}
          >
            <Text className="text-sm font-bold text-white">{initial}</Text>
          </VStack>
        );
      })}
      {remaining > 0 && (
        <VStack
          className="h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-background-100"
          style={{ marginLeft: -8, zIndex: 0 }}
        >
          <Text className="text-xs font-bold text-typography-500">
            +{remaining}
          </Text>
        </VStack>
      )}
    </HStack>
  );
}
