'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Waves, User } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/musculation', label: 'Muscu', icon: Dumbbell },
  { href: '/natation', label: 'Natation', icon: Waves },
  { href: '/profil', label: 'Profil', icon: User },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-50 items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white tracking-tight">SPORTS</span>
          <span className="badge badge-blue">SL</span>
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

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--border)] bg-[var(--bg-secondary)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-all"
              style={{
                color: active ? 'var(--accent-blue)' : 'var(--text-muted)',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
