import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ko from './locales/ko.json';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');

  if (!savedLanguage) {
    savedLanguage = 'ko'; // Default to Korean as requested
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

initI18n();

export default i18n;
