import { create } from 'zustand';
import * as MediaLibrary from 'expo-media-library';

interface NewPostState {
  selectedAssets: MediaLibrary.Asset[];
  caption: string;
  visibility: 'public' | 'group';
  setSelectedAssets: (assets: MediaLibrary.Asset[]) => void;
  setCaption: (caption: string) => void;
  setVisibility: (visibility: 'public' | 'group') => void;
  reset: () => void;
}

export const useNewPostStore = create<NewPostState>((set) => ({
  selectedAssets: [],
  caption: '',
  visibility: 'group',
  setSelectedAssets: (assets) => set({ selectedAssets: assets }),
  setCaption: (caption) => set({ caption }),
  setVisibility: (visibility) => set({ visibility }),
  reset: () => set({ selectedAssets: [], caption: '', visibility: 'group' }),
}));
