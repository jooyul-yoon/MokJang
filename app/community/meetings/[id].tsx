import { GoBackHeader } from "@/components/GoBackHeader";
import { fetchMyGroups } from "@/services/GroupsApi";
import { deleteMeeting, fetchMeetingById } from "@/services/MeetingApi";
import { fetchUserProfile } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const isLeader =
    myGroups?.some(
      (group) =>
        group.id === meeting?.group_id && group.leader_id === userProfile?.id,
    ) || false;

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

  if (isLoading || isMyGroupsLoading || isProfileLoading) {
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

      <ScrollView className="flex-1 p-4">
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
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
