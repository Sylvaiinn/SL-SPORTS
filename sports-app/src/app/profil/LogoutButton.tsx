'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="btn btn-danger btn-full btn-lg">
      {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
      {loading ? 'Déconnexion...' : 'Se déconnecter'}
    </button>
  )
}
