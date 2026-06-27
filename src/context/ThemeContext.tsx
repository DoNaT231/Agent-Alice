import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ThemeContext } from './theme-context'
import {
  applyTheme,
  getStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '../lib/theme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme(getStoredTheme()))

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
