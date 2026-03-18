'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase puts the session in the URL hash after magic link redirect:
    // #access_token=...&refresh_token=...&type=magiclink
    const hash = window.location.hash
    if (!hash) {
      router.replace('/dashboard')
      return
    }

    const params = new URLSearchParams(hash.substring(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        router.replace('/dashboard')
      })
    } else {
      // No tokens in hash — maybe PKCE code in query params
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(() => {
          router.replace('/dashboard')
        })
      } else {
        router.replace('/dashboard')
      }
    }
  }, [router, supabase])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Loader2 size={32} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Connexion en cours...</p>
      </div>
    </div>
  )
}
