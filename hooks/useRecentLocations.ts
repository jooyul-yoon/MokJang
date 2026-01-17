import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recent_locations";
const MAX_LOCATIONS = 5;

export const useRecentLocations = () => {
  const [locations, setLocations] = useState<string[]>([]);

  const loadLocations = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLocations(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load locations", error);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const addLocation = useCallback(async (location: string) => {
    if (!location || !location.trim()) return;
    const trimmed = location.trim();

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let current: string[] = stored ? JSON.parse(stored) : [];

      // Remove if exists to move to top
      current = current.filter((l) => l !== trimmed);

      // Add to top
      current.unshift(trimmed);

      // Limit size
      current = current.slice(0, MAX_LOCATIONS);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      setLocations(current);
    } catch (error) {
      console.error("Failed to save location", error);
    }
  }, []);

  return { locations, addLocation, refreshLocations: loadLocations };
};
