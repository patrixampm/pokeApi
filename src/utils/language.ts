import i18next from '../i18n';

/**
 * Switch the application language
 * @param langCode - Language code (e.g., 'en', 'es')
 * @param onComplete - Callback to execute after language change (e.g., re-render UI)
 */
export async function switchLanguage(langCode: string, onComplete?: () => void) {
  await i18next.changeLanguage(langCode);
  // Update HTML lang attribute for screen readers
  document.documentElement.lang = langCode;
  // Store preference
  localStorage.setItem('preferredLanguage', langCode);
  
  // Execute callback if provided (for re-rendering)
  if (onComplete) {
    onComplete();
  }
}
