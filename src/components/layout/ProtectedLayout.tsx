import { Navigate, Outlet } from 'react-router-dom'
import { LoginRequired } from '../auth/LoginRequired'
import { useAuth } from '../../hooks/useAuth'
import { AppLayout } from './AppLayout'

export function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <LoginRequired />
  }

  return <Outlet />
}

export function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export function RootRedirect() {
  return <Navigate to="/chat" replace />
}
