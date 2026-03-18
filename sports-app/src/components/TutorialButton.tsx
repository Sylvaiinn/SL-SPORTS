'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Tutorial from './Tutorial'
import { HelpCircle } from 'lucide-react'

interface Props {
  autoOpen?: boolean
}

export default function TutorialButton({ autoOpen = false }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (autoOpen) {
      setOpen(true)
      // Retire ?tuto=1 de l'URL sans recharger la page
      router.replace(pathname, { scroll: false })
    }
  }, [autoOpen, pathname, router])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Tutoriel"
        style={{
          width: '2.25rem', height: '2.25rem',
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
          color: 'var(--text-muted)', flexShrink: 0,
        }}
        onMouseEnter={e => {
          const b = e.currentTarget as HTMLButtonElement
          b.style.borderColor = 'rgba(59,130,246,0.5)'
          b.style.color = 'var(--accent-blue)'
          b.style.background = 'var(--accent-blue-glow)'
        }}
        onMouseLeave={e => {
          const b = e.currentTarget as HTMLButtonElement
          b.style.borderColor = 'var(--border)'
          b.style.color = 'var(--text-muted)'
          b.style.background = 'var(--bg-secondary)'
        }}
      >
        <HelpCircle size={15} />
      </button>

      {open && <Tutorial onClose={() => setOpen(false)} />}
    </>
  )
}
