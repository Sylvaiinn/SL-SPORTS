// src/types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          order: number
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          order: number
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          order?: number
        }
      }
      sets: {
        Row: {
          id: string
          exercise_id: string
          set_number: number
          weight_kg: number | null
          reps: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          exercise_id: string
          set_number: number
          weight_kg?: number | null
          reps?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          exercise_id?: string
          set_number?: number
          weight_kg?: number | null
          reps?: number | null
          notes?: string | null
        }
      }
      swim_sessions: {
        Row: {
          id: string
          user_id: string
          style: string
          distance_m: number
          plan_json: Json
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          style: string
          distance_m: number
          plan_json: Json
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          style?: string
          distance_m?: number
          plan_json?: Json
          date?: string
          created_at?: string
        }
      }
    }
  }
}
