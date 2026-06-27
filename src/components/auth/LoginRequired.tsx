import { LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function LoginRequired() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="flex h-full items-center justify-center bg-white p-4 sm:p-8 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-gray-700 dark:bg-gray-800">
        <LogIn size={32} className="mx-auto mb-4 text-indigo-500" />
        <h1 className="m-0 mb-2 text-xl text-gray-900 dark:text-gray-100">Sign in required</h1>
        <p className="m-0 mb-6 leading-relaxed text-gray-500 dark:text-gray-400">
          Sign in with Google to access your conversations and projects.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 dark:bg-indigo-400"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
