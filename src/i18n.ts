import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

// Check for stored language preference
const storedLanguage = localStorage.getItem('preferredLanguage');

i18next
  .use(LanguageDetector) // Detects user's browser language
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation }
    },
    lng: storedLanguage || undefined, // Use stored preference if available
    fallbackLng: 'en', // Default language if detection fails
    debug: false, // Set to true for debugging
    interpolation: {
      escapeValue: false // Not needed for plain text
    }
  });

// Set HTML lang attribute on init
document.documentElement.lang = i18next.language;

export default i18next;
