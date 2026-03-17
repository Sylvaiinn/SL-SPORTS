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
          bio: string | null
          city: string | null
          age: number | null
          weight_kg: number | null
          height_cm: number | null
          main_goal: string | null
          favorite_sports: string[] | null
          is_public: boolean
          banner_color: string | null
          banner_url: string | null
          weekly_goal: number
          best_streak: number
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          age?: number | null
          weight_kg?: number | null
          height_cm?: number | null
          main_goal?: string | null
          favorite_sports?: string[] | null
          is_public?: boolean
          banner_color?: string | null
          banner_url?: string | null
          weekly_goal?: number
          best_streak?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          age?: number | null
          weight_kg?: number | null
          height_cm?: number | null
          main_goal?: string | null
          favorite_sports?: string[] | null
          is_public?: boolean
          banner_color?: string | null
          banner_url?: string | null
          weekly_goal?: number
          best_streak?: number
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          duration_minutes: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date: string
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          duration_minutes?: number | null
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
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          style: string
          distance_m: number
          plan_json: Json
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          style?: string
          distance_m?: number
          plan_json?: Json
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      run_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          distance_km: number
          duration_seconds: number
          min_pace_sec: number | null
          max_pace_sec: number | null
          avg_bpm: number | null
          max_bpm: number | null
          resting_bpm: number | null
          elevation_pos: number | null
          elevation_neg: number | null
          calories: number | null
          steps: number | null
          avg_cadence: number | null
          type: string
          surface: string | null
          weather: string | null
          shoe_id: string | null
          difficulty: number | null
          goal: string | null
          notes: string | null
          is_competition: boolean
          competition_result: string | null
          competition_ranking: string | null
          competition_bib: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          distance_km: number
          duration_seconds: number
          min_pace_sec?: number | null
          max_pace_sec?: number | null
          avg_bpm?: number | null
          max_bpm?: number | null
          resting_bpm?: number | null
          elevation_pos?: number | null
          elevation_neg?: number | null
          calories?: number | null
          steps?: number | null
          avg_cadence?: number | null
          type: string
          surface?: string | null
          weather?: string | null
          shoe_id?: string | null
          difficulty?: number | null
          goal?: string | null
          notes?: string | null
          is_competition?: boolean
          competition_result?: string | null
          competition_ranking?: string | null
          competition_bib?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          distance_km?: number
          duration_seconds?: number
          min_pace_sec?: number | null
          max_pace_sec?: number | null
          avg_bpm?: number | null
          max_bpm?: number | null
          resting_bpm?: number | null
          elevation_pos?: number | null
          elevation_neg?: number | null
          calories?: number | null
          steps?: number | null
          avg_cadence?: number | null
          type?: string
          surface?: string | null
          weather?: string | null
          shoe_id?: string | null
          difficulty?: number | null
          goal?: string | null
          notes?: string | null
          is_competition?: boolean
          competition_result?: string | null
          competition_ranking?: string | null
          competition_bib?: string | null
          created_at?: string
        }
      }
      running_shoes: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          total_km: number
          max_km: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          total_km?: number
          max_km?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string | null
          total_km?: number
          max_km?: number
          active?: boolean
          created_at?: string
        }
      }
      run_records: {
        Row: {
          id: string
          user_id: string
          distance_label: string
          distance_km: number
          best_pace_sec: number
          best_session_id: string | null
          date: string
          conditions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          distance_label: string
          distance_km: number
          best_pace_sec: number
          best_session_id?: string | null
          date: string
          conditions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          distance_label?: string
          distance_km?: number
          best_pace_sec?: number
          best_session_id?: string | null
          date?: string
          conditions?: string | null
          created_at?: string
        }
      }
      weight_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          weight_kg: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight_kg: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight_kg?: number
          created_at?: string
        }
      }
      trophies: {
        Row: {
          id: string
          user_id: string
          trophy_key: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trophy_key: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trophy_key?: string
          unlocked_at?: string
        }
      }
    }
  }
}
