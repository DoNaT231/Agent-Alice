import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
