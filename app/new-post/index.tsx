import ImagePicker from "@/components/feeds/ImagePicker";
import { useNewPostStore } from "@/store/useNewPostStore";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewPostScreen() {
  const router = useRouter();
  const { setSelectedAssets } = useNewPostStore();

  const handleNext = (assets: any[]) => {
    setSelectedAssets(assets);
    router.push("/new-post/caption");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ImagePicker onNext={handleNext} onCancel={handleCancel} />
    </SafeAreaView>
  );
}
