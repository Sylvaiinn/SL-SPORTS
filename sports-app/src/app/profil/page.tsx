export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateStreak, getCurrentWeekBounds, toDateStr } from '@/lib/dashboardUtils'
import LogoutButton from './LogoutButton'
import ProfileHeader from './components/ProfileHeader'
import GlobalStats from './components/GlobalStats'
import TrophyGrid from './components/TrophyGrid'
import WeightChart from './components/WeightChart'
import GoalSection from './components/GoalSection'
import WebAuthnSetup from '@/components/WebAuthnSetup'
import type { TrophyStats } from '@/lib/trophyEngine'

interface ProfileRow {
  username: string | null; avatar_url: string | null; bio: string | null
  city: string | null; age: number | null; weight_kg: number | null; height_cm: number | null
  main_goal: string | null; banner_color: string | null; banner_url: string | null
  is_public: boolean; weekly_goal: number; best_streak: number; created_at: string
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all data in parallel
  const [
    { data: rawProfile },
    { count: totalWorkouts },
    { count: totalSwims },
    { count: totalRuns },
    { data: rawRunKm },
    { data: rawSwimM },
    { data: rawWeightLifted },
    { data: rawTrophies },
    { data: rawAllWorkoutDates },
    { data: rawAllSwimDates },
    { data: rawAllRunDates },
    { data: rawRunRecords },
    { data: rawWorkoutDurations },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('swim_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('run_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('run_sessions').select('distance_km').eq('user_id', user.id),
    supabase.from('swim_sessions').select('distance_m').eq('user_id', user.id),
    supabase.from('sets').select('weight_kg, exercise_id, exercises!inner(workout_id, workouts!inner(user_id))').eq('exercises.workouts.user_id', user.id),
    supabase.from('trophies').select('trophy_key').eq('user_id', user.id),
    supabase.from('workouts').select('date, created_at').eq('user_id', user.id),
    supabase.from('swim_sessions').select('date, created_at').eq('user_id', user.id),
    supabase.from('run_sessions').select('date, created_at').eq('user_id', user.id),
    supabase.from('run_records').select('id').eq('user_id', user.id),
    supabase.from('workouts').select('duration_minutes').eq('user_id', user.id),
  ])

  const profile = (rawProfile ?? {
    username: null, avatar_url: null, bio: null, city: null, age: null,
    weight_kg: null, height_cm: null, main_goal: null, banner_color: '#3b82f6',
    banner_url: null, is_public: true, weekly_goal: 4, best_streak: 0, created_at: user.created_at,
  }) as ProfileRow

  const nWorkouts = totalWorkouts ?? 0
  const nSwims = totalSwims ?? 0
  const nRuns = totalRuns ?? 0
  const totalSessions = nWorkouts + nSwims + nRuns

  // Total run km
  const totalRunKm = (rawRunKm ?? []).reduce((a: number, r: { distance_km: number }) => a + (r.distance_km || 0), 0)
  // Total swim meters
  const totalSwimM = (rawSwimM ?? []).reduce((a: number, r: { distance_m: number }) => a + (r.distance_m || 0), 0)
  // Total weight lifted (approximate - sum of weight_kg * reps would be better but we'll use weight_kg sum)
  const totalWeightKg = (rawWeightLifted ?? []).reduce((a: number, r: { weight_kg: number | null }) => a + (r.weight_kg ?? 0), 0)
  // Total duration from workouts (minutes)
  const totalDurationMin = (rawWorkoutDurations ?? []).reduce((a: number, r: { duration_minutes: number | null }) => a + (r.duration_minutes ?? 0), 0)

  // Streak
  const allDates = [
    ...((rawAllWorkoutDates ?? []) as { date: string }[]).map(w => w.date),
    ...((rawAllSwimDates ?? []) as { date: string }[]).map(s => s.date),
    ...((rawAllRunDates ?? []) as { date: string }[]).map(r => r.date),
  ]
  const currentStreak = calculateStreak(allDates)
  const bestStreak = Math.max(profile.best_streak, currentStreak)

  // Update best streak if needed
  if (currentStreak > profile.best_streak) {
    await supabase.from('profiles').update({ best_streak: currentStreak } as never).eq('id', user.id)
  }

  // Current week sessions for goal
  const { start: wStart, end: wEnd } = getCurrentWeekBounds()
  const currentWeekSessions = allDates.filter(d => d >= toDateStr(wStart) && d <= toDateStr(wEnd)).length

  // Trophy stats
  const unlockedKeys = ((rawTrophies ?? []) as { trophy_key: string }[]).map(t => t.trophy_key)

  // Check for all-sports-in-week
  const wStartStr = toDateStr(wStart)
  const wEndStr = toDateStr(wEnd)
  const hasWorkoutThisWeek = ((rawAllWorkoutDates ?? []) as { date: string }[]).some(w => w.date >= wStartStr && w.date <= wEndStr)
  const hasSwimThisWeek = ((rawAllSwimDates ?? []) as { date: string }[]).some(s => s.date >= wStartStr && s.date <= wEndStr)
  const hasRunThisWeek = ((rawAllRunDates ?? []) as { date: string }[]).some(r => r.date >= wStartStr && r.date <= wEndStr)

  // Check for early/late sessions
  const allCreatedAts = [
    ...((rawAllWorkoutDates ?? []) as { created_at: string }[]).map(w => w.created_at),
    ...((rawAllSwimDates ?? []) as { created_at: string }[]).map(s => s.created_at),
    ...((rawAllRunDates ?? []) as { created_at: string }[]).map(r => r.created_at),
  ]
  const hasEarly = allCreatedAts.some(c => { const h = new Date(c).getHours(); return h < 7 })
  const hasLate = allCreatedAts.some(c => { const h = new Date(c).getHours(); return h >= 21 })

  const trophyStats: TrophyStats = {
    totalSessions,
    totalWorkouts: nWorkouts,
    totalSwims: nSwims,
    totalRuns: nRuns,
    totalRunKm,
    totalSwimKm: totalSwimM / 1000,
    currentStreak,
    bestStreak,
    hasAllSportsInWeek: hasWorkoutThisWeek && hasSwimThisWeek && hasRunThisWeek,
    hasEarlySession: hasEarly,
    hasLateSession: hasLate,
    hasBrokenRecord: (rawRunRecords ?? []).length > 0,
    sessionsThisWeek: currentWeekSessions,
  }

  return (
    <div className="page-enter">
      <ProfileHeader
        userId={user.id}
        email={user.email || ''}
        profile={profile}
        totalSessions={totalSessions}
      />

      <GoalSection userId={user.id} weeklyGoal={profile.weekly_goal} currentWeekSessions={currentWeekSessions} />

      <GlobalStats
        totalWorkouts={nWorkouts}
        totalSwims={nSwims}
        totalRuns={nRuns}
        totalRunKm={totalRunKm}
        totalSwimM={totalSwimM}
        totalWeightKg={totalWeightKg}
        totalDuration={totalDurationMin * 60}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
      />

      <TrophyGrid stats={trophyStats} initialUnlocked={unlockedKeys} />

      <WeightChart userId={user.id} initialWeight={profile.weight_kg} />

      <div style={{ marginTop: '1rem' }}>
        <WebAuthnSetup />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <LogoutButton />
      </div>
    </div>
  )
}
