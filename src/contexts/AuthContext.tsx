import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Auth types
export type User = {
  id: string
  email: string
  full_name?: string
  crea_license?: string
  state?: string
  trial_end_date?: string
  subscription_status?: 'trial' | 'active' | 'expired'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, userData: { full_name: string; crea_license?: string; state?: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isTrialActive: boolean
  trialDaysLeft: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const calculateTrialStatus = (trialEndDate?: string) => {
    if (!trialEndDate) return { isActive: false, daysLeft: 0 }
    
    const endDate = new Date(trialEndDate)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return {
      isActive: diffDays > 0,
      daysLeft: Math.max(0, diffDays)
    }
  }

  const trialStatus = calculateTrialStatus(user?.trial_end_date)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata.full_name,
          crea_license: session.user.user_metadata.crea_license,
          state: session.user.user_metadata.state,
          trial_end_date: session.user.user_metadata.trial_end_date,
          subscription_status: session.user.user_metadata.subscription_status || 'trial'
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata.full_name,
            crea_license: session.user.user_metadata.crea_license,
            state: session.user.user_metadata.state,
            trial_end_date: session.user.user_metadata.trial_end_date,
            subscription_status: session.user.user_metadata.subscription_status || 'trial'
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: { full_name: string; crea_license?: string; state?: string }) => {
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 15)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          trial_end_date: trialEndDate.toISOString(),
          subscription_status: 'trial'
        }
      }
    })

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isTrialActive: trialStatus.isActive,
    trialDaysLeft: trialStatus.daysLeft
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}