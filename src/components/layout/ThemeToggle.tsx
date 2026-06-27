import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import type { Theme } from '../../lib/theme'

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="mt-auto border-t border-gray-200 px-2.5 pt-4 dark:border-white/8">
      <p className="mb-2 px-1 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-slate-500">
        Appearance
      </p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-white/5">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value

          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={[
                'flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-500/25 dark:text-slate-50 dark:shadow-none'
                  : 'text-gray-500 hover:bg-white/80 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-white/6 dark:hover:text-slate-200',
              ].join(' ')}
              aria-pressed={isActive}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
