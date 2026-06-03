import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchProperties } from '../lib/api'; // we might need api calls for settings

// Import translations
import en from '../locales/en.json';
import sk from '../locales/sk.json';
import hu from '../locales/hu.json';
import de from '../locales/de.json';
import es from '../locales/es.json';
import uk from '../locales/uk.json';
import ru from '../locales/ru.json';
import rom from '../locales/rom.json';

const translations = { en, sk, hu, de, es, uk, ru, rom };

const I18nContext = createContext(null);

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sk', label: 'Slovenčina' },
  { code: 'hu', label: 'Magyar' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'uk', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
  { code: 'rom', label: 'Romani (Gypsy)' }
];

export function I18nProvider({ children }) {
  const { user } = useAuth();
  
  // Try to load system setting and user setting from localStorage
  const [systemLang, setSystemLang] = useState(localStorage.getItem('cleaner_sys_lang') || 'en');
  const [systemName, setSystemName] = useState(localStorage.getItem('cleaner_system_name') || 'Cleaning System');
  const [userLang, setUserLang] = useState(localStorage.getItem(`cleaner_user_lang_${user?.id}`) || null);

  useEffect(() => {
    if (user && user.language) {
      setUserLang(user.language);
      localStorage.setItem(`cleaner_user_lang_${user.id}`, user.language);
    }
  }, [user]);

  const currentLang = userLang || systemLang;

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLang] || translations['en'];
    for (const k of keys) {
      if (value[k] === undefined) {
        return key; // fallback to key
      }
      value = value[k];
    }
    return value;
  };

  const changeUserLanguage = (lang) => {
    setUserLang(lang);
    if (user?.id) {
      if (lang) {
        localStorage.setItem(`cleaner_user_lang_${user.id}`, lang);
      } else {
        localStorage.removeItem(`cleaner_user_lang_${user.id}`);
      }
    }
  };

  const changeSystemLanguage = (lang) => {
    setSystemLang(lang);
    localStorage.setItem('cleaner_sys_lang', lang);
  };

  const changeSystemName = (name) => {
    setSystemName(name);
    localStorage.setItem('cleaner_system_name', name);
  };

  return (
    <I18nContext.Provider value={{ t, currentLang, systemLang, userLang, changeUserLanguage, changeSystemLanguage, systemName, changeSystemName }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
