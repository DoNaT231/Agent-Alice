import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './auth-context'
import { auth, googleProvider } from '../lib/firebase'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState(auth.currentUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signOut,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
