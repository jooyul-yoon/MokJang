import GroupDetails from "@/components/groups/GroupDetails";
import GroupList from "@/components/groups/GroupList";
import { fetchUserProfile } from "@/services/api";
import { fetchGroups, fetchMyGroups } from "@/services/GroupsApi";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: myGroups, isLoading: isLoadingMyGroups } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => fetchMyGroups(),
    enabled: !!userProfile?.id,
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {myGroups && myGroups!.length === 0 ? (
        <GroupList
          myGroups={myGroups}
          groups={groups}
          isLoading={isLoadingGroups}
        />
      ) : (
        <GroupDetails
          userProfile={userProfile}
          myGroups={myGroups}
          isLoading={isLoadingMyGroups}
        />
      )}
    </SafeAreaView>
  );
}
