import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  username: string
  password: string
  instagram?: string
  twitter?: string
  birthday: string
  profile_photo?: string
  zodiac?: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  text: string
  created_at: string
}
