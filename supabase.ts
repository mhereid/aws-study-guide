// lib/supabase.ts
import { createClient } from ‘@supabase/supabase-js’

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Question = {
id: string
question_text: string
options: string[]
correct_answer: number
explanation?: string
topic?: string
difficulty?: string
created_at?: string
}

export type UserProgress = {
id: string
user_id: string
question_id: string
selected_answer: number
is_correct: boolean
answered_at: string
}