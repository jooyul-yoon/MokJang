import GroupDetails from "@/components/groups/GroupDetails";
import GroupList from "@/components/groups/GroupList";
import { fetchUserProfile } from "@/services/api";
import { fetchGroups, fetchMyGroups } from "@/services/GroupsApi";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { t } = useTranslation();
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: myGroups = [], isLoading: isLoadingMyGroups } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => fetchMyGroups(),
    enabled: !!userProfile?.id,
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  return (
    <SafeAreaView
      className="flex-1 bg-background-muted px-6 dark:bg-background-dark"
      edges={["top", "left", "right"]}
    >
      {myGroups?.length > 0 ? (
        <GroupDetails
          userProfile={userProfile}
          groups={groups}
          myGroups={myGroups || []}
          isLoadingGroups={isLoadingGroups}
          isLoadingMyGroups={isLoadingMyGroups}
        />
      ) : (
        <GroupList groups={groups} isLoading={isLoadingGroups} />
      )}
    </SafeAreaView>
  );
}
