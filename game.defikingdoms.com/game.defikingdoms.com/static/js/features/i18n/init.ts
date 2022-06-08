import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { SupportedLanguage } from './types'

function initI18n(loadPath: string) {
  const localLanguageSetting = localStorage.getItem('defiKingdoms_languageSetting') as SupportedLanguage | null

  i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath
      },
      react: {
        useSuspense: true
      },
      fallbackLng: 'en',
      preload: [localLanguageSetting || 'en'],
      keySeparator: false,
      interpolation: { escapeValue: false },
      debug: process.env.NODE_ENV === 'development'
    })

  i18next.on('languageChanged', function (language: SupportedLanguage) {
    localStorage.setItem('defiKingdoms_languageSetting', language)
  })
}

export { initI18n }
