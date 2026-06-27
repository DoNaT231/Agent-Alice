import { Menu } from 'lucide-react'
import { useSidebar } from '../../hooks/useSidebar'

export function MobileMenuButton() {
  const { open } = useSidebar()

  return (
    <button
      type="button"
      onClick={open}
      className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden dark:text-slate-300 dark:hover:bg-white/6"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  )
}
