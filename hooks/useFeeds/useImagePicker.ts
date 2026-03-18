import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export const useImagePicker = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<MediaLibrary.Asset[]>(
    [],
  );
  const [currentPreview, setCurrentPreview] =
    useState<MediaLibrary.Asset | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");
      if (status === "granted") {
        loadAssets();
      }
    })();
  }, []);

  const loadAssets = useCallback(async () => {
    if (isFetching || !hasNextPage) return;
    setIsFetching(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first: 40,
        after: endCursor,
        mediaType: "photo",
        sortBy: ["creationTime"],
      });

      setAssets((prev) => [...prev, ...result.assets]);
      setHasNextPage(result.hasNextPage);
      setEndCursor(result.endCursor);

      if (!currentPreview && result.assets.length > 0) {
        setCurrentPreview(result.assets[0]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load images from device");
    } finally {
      setIsFetching(false);
    }
  }, [endCursor, hasNextPage, isFetching, currentPreview]);

  const toggleSelection = (
    asset: MediaLibrary.Asset,
    isMultiSelection: boolean,
  ) => {
    if (!isMultiSelection) {
      // Single selection mode
      setSelectedAssets([asset]);
      setCurrentPreview(asset);
      return;
    }

    // Multi selection mode
    setSelectedAssets((prev) => {
      const index = prev.findIndex((a) => a.id === asset.id);
      if (index >= 0) {
        // Deselect
        const newSelected = prev.filter((a) => a.id !== asset.id);
        if (newSelected.length > 0) {
          setCurrentPreview(newSelected[newSelected.length - 1]);
        }
        return newSelected;
      } else {
        // Limit selection to 10 max
        if (prev.length >= 10) {
          Alert.alert("Limit Reached", "You can only select up to 10 images");
          return prev;
        }
        // Select
        setCurrentPreview(asset);
        return [...prev, asset];
      }
    });
  };

  return {
    hasPermission,
    assets,
    selectedAssets,
    setSelectedAssets,
    currentPreview,
    setCurrentPreview,
    loadAssets,
    toggleSelection,
  };
};
