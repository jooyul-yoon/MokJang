import { GoBackHeader } from "@/components/GoBackHeader";
import { fetchMyGroups } from "@/services/GroupsApi";
import {
  deleteMeeting,
  fetchMeetingAttendances,
  fetchMeetingById,
  upsertMeetingAttendance,
} from "@/services/MeetingApi";
import { fetchUserProfile } from "@/services/api";
import { onRefreshHelper } from "@/utils/refreshHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { t } from "i18next";
import {
  AlignLeft,
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "../../../components/ui/button";
import { Center } from "../../../components/ui/center";
import { Heading } from "../../../components/ui/heading";
import { HStack } from "../../../components/ui/hstack";
import { Icon } from "../../../components/ui/icon";
import { Text } from "../../../components/ui/text";
import { VStack } from "../../../components/ui/vstack";

const formatDate = (dateString: string, language: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};

const formatTime = (dateString: string, language: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: language === "en-US",
  });
};

function EditableRow({
  icon: IconComponent,
  label,
  value,
  onPress,
  isEditable,
  isMultiline = false,
  isLast = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onPress?: () => void;
  isEditable: boolean;
  isMultiline?: boolean;
  isLast?: boolean;
}) {
  const content = (
    <HStack
      space="sm"
      className={`items-center justify-between ${!isLast ? "border-b border-outline-100 pb-4" : ""} pt-2`}
    >
      <HStack className="items-center" space="sm">
        <Icon as={IconComponent} size="md" className="text-primary-500" />
        <Text className="text-lg text-typography-800">{label}</Text>
      </HStack>
      <HStack className="items-center" space="sm">
        <Text
          className={`text-lg font-medium text-typography-900 ${value ? "" : "text-typography-400"} ${isMultiline ? "mt-1 leading-6" : ""}`}
        >
          {value || t("common.empty")}
        </Text>

        {isEditable && onPress && (
          <TouchableOpacity className="-mr-2 p-2" onPress={onPress}>
            <Icon as={Pencil} size="md" className="text-typography-400" />
          </TouchableOpacity>
        )}
      </HStack>
    </HStack>
  );

  return content;
}

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const language = i18n.language === "en" ? "en-US" : "ko-KR";
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: myGroups, isLoading: isMyGroupsLoading } = useQuery({
    queryKey: ["myGroups"],
    queryFn: fetchMyGroups,
  });

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const { data: meeting, isLoading } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => fetchMeetingById(id),
    enabled: !!id,
  });

  const { data: attendances = [], isLoading: isAttendancesLoading } = useQuery({
    queryKey: ["meetingAttendances", id],
    queryFn: () => fetchMeetingAttendances(id),
    enabled: !!id,
  });

  const attendanceMutation = useMutation({
    mutationFn: (status: "attending" | "absent") =>
      upsertMeetingAttendance(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetingAttendances", id] });
    },
  });

  const handleAttendance = (status: "attending" | "absent") => {
    attendanceMutation.mutate(status);
  };

  const isLeader =
    myGroups?.some(
      (group) =>
        group.id === meeting?.group_id && group.leader_id === userProfile?.id,
    ) || false;

  const onRefresh = useCallback(() => {
    onRefreshHelper(setRefreshing, ["meeting", "meetingAttendances"]);
  }, []);

  const handleDeleteMeeting = async () => {
    if (!myGroups) return;
    if (!myGroups[0]?.id) return;

    Alert.alert(
      t("community.deleteMeetingTitle"),
      t("community.deleteMeetingMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            const error = await deleteMeeting(id);
            if (!error) {
              queryClient.invalidateQueries({ queryKey: ["meetings"] });
              router.back();
            } else {
              Alert.alert(
                t("common.error"),
                error || t("community.deleteMeetingError"),
              );
            }
          },
        },
      ],
    );
  };

  if (
    isLoading ||
    isMyGroupsLoading ||
    isProfileLoading ||
    isAttendancesLoading
  ) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
        <Stack.Screen
          options={{
            title: t("community.meetings", "모임"),
            headerShown: false,
          }}
        />
        <Center className="flex-1">
          <ActivityIndicator size="large" />
        </Center>
      </SafeAreaView>
    );
  }

  if (!meeting) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
        <Stack.Screen
          options={{ title: t("common.error", "Error"), headerShown: false }}
        />
        <HStack className="items-center border-b border-outline-100 p-4">
          <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2">
            <Icon as={ArrowLeft} size="lg" className="text-typography-900" />
          </TouchableOpacity>
          <Heading size="md" className="ml-2 flex-1 text-typography-900">
            {t("common.error", "Error")}
          </Heading>
        </HStack>

        <ScrollView className="flex-1 p-4">
          <Text className="text-typography-500">
            {t("community.noMeetings", "모임을 찾을 수 없습니다.")}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <Stack.Screen options={{ title: meeting.title, headerShown: false }} />
      <GoBackHeader
        title={meeting.title}
        rightElement={
          isLeader && (
            <TouchableOpacity
              activeOpacity={0.5}
              className="p-2"
              onPress={handleDeleteMeeting}
            >
              <Icon as={Trash2} size="md" className="text-error-500" />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1 p-4"
      >
        <VStack space="md" className="p-4">
          <EditableRow
            icon={CalendarDays}
            label={t("community.meetingName")}
            value={meeting.title}
            isEditable={isLeader}
            onPress={() => router.push(`/community/meetings/${id}/edit-title`)}
          />

          <EditableRow
            icon={CalendarDays}
            label={t("community.meetingDate")}
            value={formatDate(meeting.meeting_time, language)}
            isEditable={isLeader}
            onPress={() =>
              router.push(`/community/meetings/${id}/edit-datetime`)
            }
          />

          <EditableRow
            icon={Clock}
            label={t("community.meetingTime")}
            value={formatTime(meeting.meeting_time, language)}
            isEditable={isLeader}
            onPress={() =>
              router.push(`/community/meetings/${id}/edit-datetime`)
            }
          />

          <EditableRow
            icon={MapPin}
            label={t("community.location")}
            value={meeting.location || ""}
            isEditable={isLeader}
            onPress={() =>
              router.push(`/community/meetings/${id}/edit-location`)
            }
            isLast={!meeting.memo && !meeting.profiles?.full_name}
          />

          {(meeting.memo || isLeader) && (
            <EditableRow
              icon={AlignLeft}
              label={t("community.memo")}
              value={meeting.memo || ""}
              isEditable={isLeader}
              onPress={() => router.push(`/community/meetings/${id}/edit-memo`)}
              isMultiline
              isLast={!meeting.profiles?.full_name}
            />
          )}

          {meeting.profiles?.full_name && (
            <VStack space="xs" className="mt-2 rounded-lg bg-primary-50 p-3">
              <Text className="text-xs text-primary-600">
                {t("community.host")}
              </Text>
              <Text className="text-sm font-bold text-primary-900">
                {meeting.profiles.full_name}
              </Text>
            </VStack>
          )}

          <VStack space="md" className="mt-4 border-t border-outline-100 pt-4">
            <HStack space="md" className="justify-center">
              <Button
                variant={
                  attendances.find((a) => a.user_id === userProfile?.id)
                    ?.status === "attending"
                    ? "solid"
                    : "outline"
                }
                onPress={() => handleAttendance("attending")}
                className="flex-1"
              >
                <ButtonText
                  size="md"
                  className={`font-bold ${
                    attendances.find((a) => a.user_id === userProfile?.id)
                      ?.status === "attending"
                      ? "text-white dark:text-typography-50"
                      : "text-typography-500 dark:text-typography-300"
                  }`}
                >
                  {t("community.attending")}
                </ButtonText>
              </Button>
              <Button
                variant={
                  attendances.find((a) => a.user_id === userProfile?.id)
                    ?.status === "absent"
                    ? "solid"
                    : "outline"
                }
                onPress={() => handleAttendance("absent")}
                className="flex-1"
              >
                <ButtonText
                  size="md"
                  className={`font-bold ${
                    attendances.find((a) => a.user_id === userProfile?.id)
                      ?.status === "absent"
                      ? "text-white dark:text-typography-50"
                      : "text-typography-500 dark:text-typography-300"
                  }`}
                >
                  {t("community.absent")}
                </ButtonText>
              </Button>
            </HStack>

            <HStack className="mt-4 h-full">
              <VStack space="sm" className="flex-1">
                <Text className="text-lg font-bold text-typography-900">
                  {t("community.attendees")} (
                  {attendances.filter((a) => a.status === "attending").length})
                </Text>
                <VStack className="gap-4">
                  {attendances
                    .filter((a) => a.status === "attending")
                    .map((a) => (
                      <HStack
                        key={a.id}
                        className="h-6 items-center border-l-2 border-primary-500 px-3"
                      >
                        <Text className="text-medium text-primary-900">
                          {a.profiles?.full_name || t("common.unknown")}
                        </Text>
                      </HStack>
                    ))}
                </VStack>
              </VStack>

              <VStack space="sm" className="flex-1 text-typography-500 ">
                <Text className="text-lg font-bold text-typography-500">
                  {t("community.absentees")} (
                  {attendances.filter((a) => a.status === "absent").length})
                </Text>
                <VStack className="gap-4">
                  {attendances
                    .filter((a) => a.status === "absent")
                    .map((a) => (
                      <HStack
                        key={a.id}
                        className="h-6 items-center border-l-2 border-secondary-500 px-3"
                      >
                        <Text className="text-medium text-typography-500">
                          {a.profiles?.full_name || t("common.unknown")}
                        </Text>
                      </HStack>
                    ))}
                </VStack>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
