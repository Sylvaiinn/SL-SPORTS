'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from './AvatarUpload'
import BannerEditor from './BannerEditor'
import ProfileEditor from './ProfileEditor'
import { calculateLevel } from '@/lib/trophyEngine'
import { Settings, Eye, EyeOff, MapPin } from 'lucide-react'

interface ProfileHeaderProps {
  userId: string
  email: string
  profile: {
    username: string | null
    avatar_url: string | null
    bio: string | null
    city: string | null
    age: number | null
    weight_kg: number | null
    height_cm: number | null
    main_goal: string | null
    banner_color: string | null
    banner_url: string | null
    is_public: boolean
    created_at: string
  }
  totalSessions: number
}

export default function ProfileHeader({ userId, email, profile: initialProfile, totalSessions }: ProfileHeaderProps) {
  const supabase = createClient()
  const [profile, setProfile] = useState(initialProfile)
  const [editing, setEditing] = useState(false)
  const [bannerColor, setBannerColor] = useState(profile.banner_color || '#3b82f6')
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [isPublic, setIsPublic] = useState(profile.is_public)

  const level = calculateLevel(totalSessions)
  const displayName = profile.username || email.split('@')[0]

  async function togglePublic() {
    const newVal = !isPublic
    setIsPublic(newVal)
    await supabase.from('profiles').update({ is_public: newVal } as never).eq('id', userId)
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Banner */}
      <div className="profile-banner" style={{
        background: bannerUrl
          ? `url(${bannerUrl}) center/cover`
          : `linear-gradient(135deg, ${bannerColor}, ${bannerColor}88)`,
      }}>
        <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem' }}>
          <BannerEditor userId={userId} currentColor={bannerColor} currentUrl={bannerUrl}
            onUpdated={(color, url) => { if (color) setBannerColor(color); setBannerUrl(url); }} />
        </div>
      </div>

      {/* Avatar + info card */}
      <div className="card" style={{ borderRadius: '0 0 1rem 1rem', borderTop: 'none', position: 'relative', paddingTop: '3rem' }}>
        {/* Avatar */}
        <div style={{ position: 'absolute', top: '-2.5rem', left: '1.25rem' }}>
          <AvatarUpload userId={userId} currentUrl={avatarUrl} username={profile.username} onUploaded={setAvatarUrl} />
        </div>

        {/* Public/Private toggle */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.375rem' }}>
          <button onClick={togglePublic} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
            {isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
            {isPublic ? 'Public' : 'Privé'}
          </button>
          <button onClick={() => setEditing(!editing)} className="btn btn-ghost btn-sm">
            <Settings size={13} />
          </button>
        </div>

        {/* Name & details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem' }}>{displayName}</h2>
            <span className="badge" style={{
              background: `${level.color}20`, color: level.color,
              border: `1px solid ${level.color}50`, fontSize: '0.7rem',
            }}>{level.label}</span>
          </div>

          {profile.bio && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>{profile.bio}</p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {profile.city && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={12} /> {profile.city}
              </span>
            )}
            {profile.main_goal && (
              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{profile.main_goal}</span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Editor */}
      {editing && (
        <div style={{ marginTop: '0.75rem' }}>
          <ProfileEditor userId={userId} initial={{
            username: profile.username, bio: profile.bio, city: profile.city,
            age: profile.age, weight_kg: profile.weight_kg, height_cm: profile.height_cm,
            main_goal: profile.main_goal,
          }} onSaved={(data) => {
            setProfile({ ...profile, ...data })
            setEditing(false)
          }} onClose={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}
