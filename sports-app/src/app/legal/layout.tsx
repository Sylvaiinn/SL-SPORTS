import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', height: '3.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none', color: '#94a3b8', fontSize: '0.875rem' }}>
            <ChevronLeft size={16} />
            Accueil
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>Informations légales</span>
        </div>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <Link href="/legal/mentions-legales" style={{ fontSize: '0.8125rem', color: '#475569', textDecoration: 'none' }}>Mentions légales</Link>
          <Link href="/legal/confidentialite" style={{ fontSize: '0.8125rem', color: '#475569', textDecoration: 'none' }}>Confidentialité</Link>
          <Link href="/legal/cgu" style={{ fontSize: '0.8125rem', color: '#475569', textDecoration: 'none' }}>CGU</Link>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>© 2025 SPORTS.SL</p>
      </footer>
    </div>
  )
}
