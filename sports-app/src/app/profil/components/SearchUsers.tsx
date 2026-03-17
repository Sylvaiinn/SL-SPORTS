'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface UserResult {
  id: string
  username: string | null
  avatar_url: string | null
}

export default function SearchUsers() {
  const supabase = createClient()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query.trim()}%`)
        .limit(8)
      setResults((data ?? []) as UserResult[])
      setLoading(false)
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
        Rechercher un utilisateur
      </div>
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par pseudo..." style={{ paddingLeft: '2.25rem' }} />
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {results.map(user => (
            <button key={user.id} onClick={() => user.username && router.push(`/profil/${user.username}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem',
                borderRadius: '0.625rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                cursor: user.username ? 'pointer' : 'default', fontFamily: 'inherit', width: '100%',
                textAlign: 'left', transition: 'all 0.2s',
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
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {user.username || 'Utilisateur'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Recherche...</div>}
    </div>
  )
}
