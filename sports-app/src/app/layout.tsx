import type { Metadata } from 'next'
import './globals.css'
import NavbarWrapper from '@/components/NavbarWrapper'

export const metadata: Metadata = {
  title: 'SPORTS.SL — Suivi Sportif',
  description: 'Suivez vos séances de musculation et de natation avec SPORTS.SL. Historique, templates, générateur de séances.',
  openGraph: {
    title: 'SPORTS.SL — Suivi Sportif',
    description: 'Suivez vos séances de musculation et de natation. Historique, templates, générateur de séances natation.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'SPORTS.SL',
  },
  twitter: {
    card: 'summary',
    title: 'SPORTS.SL — Suivi Sportif',
    description: 'Application de suivi de musculation et natation.',
  },
  applicationName: 'SPORTS.SL',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SPORTS.SL',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="app-layout">
        <NavbarWrapper />
        <main className="page-content">
          {children}
          <footer style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <a href="/legal/mentions-legales" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Mentions légales</a>
              <a href="/legal/confidentialite" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Confidentialité</a>
              <a href="/legal/cgu" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>CGU</a>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.4, margin: 0 }}>© 2025 SPORTS.SL</p>
          </footer>
        </main>
      </body>
    </html>
  )
}
