'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Waves, Footprints, User, Search, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, activeColor: 'var(--accent-blue)' },
  { href: '/musculation', label: 'Muscu', icon: Dumbbell, activeColor: 'var(--accent-blue)' },
  { href: '/natation', label: 'Natation', icon: Waves, activeColor: 'var(--accent-teal)' },
  { href: '/course', label: 'Course', icon: Footprints, activeColor: 'var(--accent-green)' },
  { href: '/profil', label: 'Profil', icon: User, activeColor: 'var(--accent-blue)' },
]

interface UserResult {
  id: string
  username: string | null
  avatar_url: string | null
  is_public: boolean
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_public')
        .ilike('username', `%${query.trim()}%`)
        .limit(8)
      setResults((data ?? []) as UserResult[])
      setLoading(false)
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
        setQuery('')
        setResults([])
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(e: React.MouseEvent | React.TouchEvent, user: UserResult) {
    e.preventDefault()
    e.stopPropagation()
    if (!user.username) return
    setShowSearch(false)
    setQuery('')
    setResults([])
    // Blur any focused input to dismiss keyboard on mobile
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    router.push(`/profil/${user.username}`)
  }

  const searchDropdown = (results.length > 0 || loading) && (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.375rem',
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: '0.75rem', overflow: 'hidden', zIndex: 100,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      {loading && (
        <div style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Recherche...
        </div>
      )}
      {results.map(user => (
        <button key={user.id} onClick={e => handleSelect(e, user)} onTouchEnd={e => handleSelect(e, user)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem',
            width: '100%', textAlign: 'left', fontFamily: 'inherit',
            background: 'transparent', border: 'none', cursor: user.username ? 'pointer' : 'default',
            transition: 'background 0.15s', color: 'var(--text-primary)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>
                {user.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.username || 'Utilisateur'}
            </div>
          </div>
          {!user.is_public && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🔒</span>
          )}
        </button>
      ))}
    </div>
  )

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-50 items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white tracking-tight">SPORTS</span>
          <span className="badge badge-blue">SL</span>
        </div>

        {/* Desktop search */}
        <div ref={searchRef} style={{ position: 'relative', width: '14rem' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            placeholder="Rechercher..."
            style={{ paddingLeft: '2rem', height: '2rem', fontSize: '0.8125rem' }}
          />
          {showSearch && searchDropdown}
        </div>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="md:hidden" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: 'var(--bg-primary)', padding: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                className="input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                style={{ paddingLeft: '2rem', fontSize: '0.875rem' }}
                autoFocus
              />
            </div>
            <button onClick={() => { setShowSearch(false); setQuery(''); setResults([]) }}
              className="btn btn-ghost btn-sm">
              <X size={18} />
            </button>
          </div>
          {loading && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.5rem' }}>Recherche...</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {results.map(user => (
              <button key={user.id} onClick={e => handleSelect(e, user)} onTouchEnd={e => handleSelect(e, user)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 0.75rem', minHeight: '56px',
                  width: '100%', textAlign: 'left', fontFamily: 'inherit',
                  background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)',
                  cursor: user.username ? 'pointer' : 'default', color: 'var(--text-primary)',
                }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white' }}>
                      {user.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {user.username || 'Utilisateur'}
                  </div>
                </div>
                {!user.is_public && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom bar */}
      <nav className="md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'stretch',
        minHeight: '64px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Search button */}
        <button
          onClick={() => setShowSearch(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flex: 1, gap: '0.25rem', padding: '0.5rem 0',
            color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none',
            fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <Search size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 400 }}>Chercher</span>
        </button>
        {links.map(({ href, label, icon: Icon, activeColor }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flex: 1, gap: '0.25rem', padding: '0.5rem 0',
                color: active ? activeColor : 'rgba(255,255,255,0.4)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: '0.6875rem', fontWeight: active ? 700 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
