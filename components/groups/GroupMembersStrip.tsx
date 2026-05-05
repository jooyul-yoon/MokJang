import { fetchGroupMembers } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Crown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

interface GroupMembersStripProps {
  groupId: string;
  leaderId: string | null;
}

export function GroupMembersStrip({
  groupId,
  leaderId,
}: GroupMembersStripProps) {
  const { t } = useTranslation();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => fetchGroupMembers(groupId),
  });

  if (isLoading) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  // Bring leader to front
  const sortedMembers = [...members].sort((a, b) => {
    if (a.user_id === leaderId) return -1;
    if (b.user_id === leaderId) return 1;
    return 0;
  });

  return (
    <VStack className="mt-4 pt-2">
      <HStack className="mb-3 items-center justify-between px-4">
        <Text className="text-base font-bold tracking-[-0.3px] text-typography-900">
          {t("community.members", "목원 목록")}
        </Text>
      </HStack>

      <FlatList
        data={sortedMembers}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 gap-3.5 pb-1"
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => {
          const profile = item.profiles;
          const isLeader = item.user_id === leaderId;
          const name = profile?.full_name || "?";
          console.log(isLeader);
          return (
            <VStack className="items-center" space="xs">
              <View className="relative">
                <Avatar
                  size="md"
                  className="h-[46px] w-[46px] border border-outline-100 bg-primary-500 shadow-sm"
                >
                  <AvatarFallbackText className="text-white">
                    {name}
                  </AvatarFallbackText>
                  {profile?.avatar_url && (
                    <AvatarImage source={{ uri: profile.avatar_url }} />
                  )}
                </Avatar>
                {isLeader && (
                  <View className="absolute -right-1 -top-1 rounded-full bg-background-0 p-0.5">
                    <Crown size={14} color="#FFD109" fill="#FFD109" />
                  </View>
                )}
              </View>
              <Text className="text-[11px] font-medium tracking-[-0.1px] text-typography-700">
                {name}
              </Text>
            </VStack>
          );
        }}
      />
    </VStack>
  );
}
