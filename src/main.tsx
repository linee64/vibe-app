import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import '@fontsource/jetbrains-mono/500.css'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './store.tsx'
import { ToastProvider } from './components/Toast.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { FeedbackProvider } from './components/FeedbackProvider.tsx'
import { initSentry } from './lib/sentry.ts'
import { initLocale, onUserLocaleChange } from './i18n/runtime.ts'
import { track } from './lib/analytics.ts'
import { LocaleKeyed } from './i18n/react.ts'

// Sentry (если задан VITE_SENTRY_DSN) грузится отдельным чанком и не тормозит первый экран
initSentry()

onUserLocaleChange((to, from) => track('language_changed', { from, to }))

// Язык: сохранённый → язык браузера → en; каталог и контент языка — отдельные чанки, ждём их до первого кадра
void initLocale().finally(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <ToastProvider>
          <StoreProvider>
            <LocaleKeyed>
              <FeedbackProvider>
                <App />
              </FeedbackProvider>
            </LocaleKeyed>
          </StoreProvider>
        </ToastProvider>
      </ErrorBoundary>
    </StrictMode>,
  ),
)
