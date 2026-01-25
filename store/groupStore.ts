import { Group } from "@/types/typeGroups";
import { create } from "zustand";

interface GroupState {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  selectedGroup: null,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
}));
