import { createMeeting, Group, Meeting, volunteerForMeeting } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TFunction } from "i18next";
import { useState } from "react";

export const useMeetingActions = (
  userGroup: Group | null | undefined,
  t: TFunction,
  initialDate: string,
) => {
  const queryClient = useQueryClient();

  // Create Meeting State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeetingType, setNewMeetingType] = useState<"mokjang" | "general">(
    "mokjang",
  );
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingDate, setNewMeetingDate] = useState(new Date(initialDate));
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [newMeetingLocation, setNewMeetingLocation] = useState("");
  const [newMeetingMemo, setNewMeetingMemo] = useState("");

  // Volunteer State
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  const resetCreateForm = () => {
    setNewMeetingType("mokjang");
    setNewMeetingTitle("");
    setNewMeetingDate(new Date());
    setIsVolunteerOpen(false);
    setNewMeetingLocation("");
    setNewMeetingMemo("");
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!userGroup) return;
      await createMeeting({
        group_id: userGroup.id,
        type: newMeetingType,
        title:
          newMeetingType === "general"
            ? newMeetingTitle
            : t("community.mokjangMeeting"),
        meeting_time: newMeetingDate.toISOString(),
        location: isVolunteerOpen ? undefined : newMeetingLocation,
        host_id: isVolunteerOpen ? null : userGroup.leader_id,
        memo: newMeetingMemo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setShowCreateModal(false);
      resetCreateForm();
    },
    onError: (error) => {
      console.error("Create meeting failed:", error);
    },
  });

  const volunteerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMeeting) return;
      await volunteerForMeeting(selectedMeeting, locationInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setShowVolunteerModal(false);
      setLocationInput("");
      setSelectedMeeting(null);
    },
    onError: (error) => {
      console.error("Volunteer failed:", error);
    },
  });

  const handleVolunteerClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setLocationInput(meeting.location || userGroup?.region || "");
    setShowVolunteerModal(true);
  };

  return {
    createState: {
      showModal: showCreateModal,
      setShowModal: setShowCreateModal,
      type: newMeetingType,
      setType: setNewMeetingType,
      title: newMeetingTitle,
      setTitle: setNewMeetingTitle,
      date: newMeetingDate,
      setDate: setNewMeetingDate,
      isVolunteerOpen,
      setIsVolunteerOpen,
      location: newMeetingLocation,
      setLocation: setNewMeetingLocation,
      memo: newMeetingMemo,
      setMemo: setNewMeetingMemo,
    },
    volunteerState: {
      showModal: showVolunteerModal,
      setShowModal: setShowVolunteerModal,
      locationInput,
      setLocationInput,
      selectedMeeting,
    },
    actions: {
      createMeeting: () => createMutation.mutate(),
      volunteer: () => volunteerMutation.mutate(),
      handleVolunteerClick,
      resetCreateForm,
    },
    status: {
      isCreating: createMutation.isPending,
      isVolunteering: volunteerMutation.isPending,
    },
  };
};
