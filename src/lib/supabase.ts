import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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