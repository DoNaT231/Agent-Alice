export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'agent-alice-theme'

export function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(stored: Theme | null): Theme {
  return stored ?? getSystemTheme()
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}
