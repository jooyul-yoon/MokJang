import React, { useState } from 'react';
import { Dimensions, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useImagePicker } from '@/hooks/useFeeds/useImagePicker';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const THUMB_SIZE = width / COLUMN_COUNT;

interface ImagePickerProps {
  onNext: (selectedAssets: any[]) => void;
  onCancel: () => void;
}

export default function ImagePicker({ onNext, onCancel }: ImagePickerProps) {
  const { t } = useTranslation();
  const { 
    hasPermission, 
    assets, 
    selectedAssets, 
    currentPreview, 
    loadAssets, 
    toggleSelection 
  } = useImagePicker();
  
  const [isMultiSelection, setIsMultiSelection] = useState(false);

  if (hasPermission === false) {
    return (
      <Box className="flex-1 items-center justify-center p-4">
        <Text className="text-center mb-4">No access to photo library.</Text>
        <Button onPress={onCancel}>
          <ButtonText>{t('feed.picker.cancel')}</ButtonText>
        </Button>
      </Box>
    );
  }

  if (assets.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  const handleNext = () => {
    if (selectedAssets.length > 0) {
      onNext(selectedAssets);
    } else if (currentPreview) {
      onNext([currentPreview]);
    }
  };

  const toggleMultiSelect = () => {
    setIsMultiSelection(!isMultiSelection);
    // If turning off multi-select, clear others
    if (isMultiSelection && selectedAssets.length > 1) {
      toggleSelection(selectedAssets[selectedAssets.length - 1], false);
    }
  };

  return (
    <VStack className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 border-b border-outline-100 dark:border-outline-800">
        <Pressable onPress={onCancel}>
          <IconSymbol name="xmark" size={24} color="gray" />
        </Pressable>
        <Text className="font-bold text-lg">{t('feed.post.new')}</Text>
        <Pressable onPress={handleNext}>
          <Text className="text-primary-500 font-bold">{t('feed.picker.next')}</Text>
        </Pressable>
      </HStack>

      {/* Main Preview */}
      <Box style={{ width, height: width }} className="bg-black relative">
        {currentPreview && (
          <Image
            source={{ uri: currentPreview.uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        )}
        
        {/* Multi-Select Toggle Button */}
        <Pressable 
          onPress={toggleMultiSelect}
          className={`absolute bottom-3 right-3 rounded-full p-2 bg-black/50 border border-white/50 ${isMultiSelection ? 'bg-primary-500/80 border-primary-500' : ''}`}
        >
          <IconSymbol name="square.on.square" size={20} color="white" />
        </Pressable>
      </Box>

      {/* Thumbnails Header */}
      <HStack className="items-center justify-between px-4 py-3">
        <Text className="font-semibold text-base">{t('feed.picker.recents')}</Text>
      </HStack>

      {/* Thumbnails Grid */}
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        onEndReached={loadAssets}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => {
          const selectedIndex = selectedAssets.findIndex((a) => a.id === item.id);
          const isSelected = selectedIndex >= 0;
          const isCurrent = currentPreview?.id === item.id;

          return (
            <Pressable 
              onPress={() => toggleSelection(item, isMultiSelection)}
              style={[{ width: THUMB_SIZE, height: THUMB_SIZE }, styles.thumbContainer]}
            >
              <Image
                source={{ uri: item.uri }}
                style={[{ width: '100%', height: '100%' }, isCurrent && !isMultiSelection ? styles.selectedOverlay : null]}
                contentFit="cover"
              />
              {isMultiSelection && isSelected && (
                <Box className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary-500 items-center justify-center border border-white">
                  <Text className="text-white text-xs font-bold">{selectedIndex + 1}</Text>
                </Box>
              )}
            </Pressable>
          );
        }}
      />
    </VStack>
  );
}

const styles = StyleSheet.create({
  thumbContainer: {
    padding: 1,
  },
  selectedOverlay: {
    opacity: 0.5,
  }
});
