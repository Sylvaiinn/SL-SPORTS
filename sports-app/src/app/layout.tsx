import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

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
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </body>
    </html>
  )
}
