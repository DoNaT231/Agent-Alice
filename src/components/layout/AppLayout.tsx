import type { ReactNode } from 'react'
import { SidebarProvider } from '../../context/SidebarContext'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </SidebarProvider>
  )
}
