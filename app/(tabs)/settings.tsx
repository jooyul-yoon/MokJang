import i18n from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();

  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6 text-typography-black dark:text-typography-white">
          {t('common.settings')}
        </Text>
        
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-2 text-typography-black dark:text-typography-white">
            {t('common.language')}
          </Text>
          
          <View className="flex-row gap-4">
            <TouchableOpacity 
              onPress={() => changeLanguage('ko')}
              className={`flex-1 p-4 rounded-lg border items-center justify-center ${
                i18n.language === 'ko' 
                  ? 'bg-primary-500 border-primary-500' 
                  : 'bg-background-0 border-outline-200 dark:border-outline-700'
              }`}
            >
              <Text className={`font-medium ${
                i18n.language === 'ko' 
                  ? 'text-typography-white' 
                  : 'text-typography-black dark:text-typography-white'
              }`}>
                {t('common.korean')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => changeLanguage('en')}
              className={`flex-1 p-4 rounded-lg border items-center justify-center ${
                i18n.language === 'en' 
                  ? 'bg-primary-500 border-primary-500' 
                  : 'bg-background-0 border-outline-200 dark:border-outline-700'
              }`}
            >
              <Text className={`font-medium ${
                i18n.language === 'en' 
                  ? 'text-typography-white' 
                  : 'text-typography-black dark:text-typography-white'
              }`}>
                {t('common.english')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2 text-typography-black dark:text-typography-white">
            {t('common.theme')}
          </Text>
          
          <View className="flex-row gap-2">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity 
                key={mode}
                onPress={() => setColorScheme(mode)}
                className={`flex-1 p-4 rounded-lg border items-center justify-center ${
                  colorScheme === mode 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'bg-background-0 border-outline-200 dark:border-outline-700'
                }`}
              >
                <Text className={`font-medium ${
                  colorScheme === mode 
                    ? 'text-typography-white' 
                    : 'text-typography-black dark:text-typography-white'
                }`}>
                  {t(`common.${mode}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
