import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import en from './locales/en.json'
import ru from './locales/ru.json'
import type { LocaleCode } from './types'

const STORAGE_KEY = 'clio-lang'

const MESSAGES: Record<LocaleCode, Record<string, string>> = { en, ru }

type I18nContextValue = {
  locale: LocaleCode
  setLocale: (code: LocaleCode) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readInitialLocale(): LocaleCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'ru' || v === 'en') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(readInitialLocale)

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (key: string) => MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key,
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n outside I18nProvider')
  return ctx
}

export const EDITORIAL_READONLY =
  import.meta.env.VITE_EDITORIAL_READONLY === 'true' || import.meta.env.PROD
