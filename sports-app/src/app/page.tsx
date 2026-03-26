export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, Waves, Footprints, Trophy, TrendingUp, Users, ChevronRight, Check, Zap } from 'lucide-react'

export default async function LandingPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch { /* affiche la landing page si auth échoue */ }
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.25rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white' }}>SL</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>SPORTS.SL</span>
          </div>
          <Link href="/login" style={{ textDecoration: 'none', padding: '0.5rem 1.125rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}>
            Se connecter
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '4.5rem 1.25rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '99px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '1.75rem' }}>
            <Zap size={13} color="#60a5fa" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa' }}>Musculation · Natation · Course à pied</span>
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Suivez toutes vos{' '}
            <span style={{ color: '#60a5fa' }}>performances</span>{' '}
            sportives
          </h1>

          <p style={{ fontSize: '1.0625rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.25rem' }}>
            Une application tout-en-un pour tracker vos séances, générer des plans de natation, analyser vos runs et débloquer des trophées. Progressez semaine après semaine.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontSize: '1rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
              Commencer gratuitement <ChevronRight size={18} />
            </Link>
            <Link href="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '0.875rem 1.5rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#f1f5f9', fontSize: '1rem', fontWeight: 600 }}>
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Sport cards */}
      <section style={{ padding: '1.5rem 1.25rem', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {[
            {
              icon: <Dumbbell size={20} color="#a78bfa" />,
              iconBg: 'rgba(139,92,246,0.15)',
              border: 'rgba(139,92,246,0.2)',
              bg: 'rgba(139,92,246,0.05)',
              color: '#a78bfa',
              title: 'Musculation',
              desc: 'Créez vos séances, suivez le volume soulevé et progressez exercice par exercice.',
              features: ['Templates A/B/C inclus', 'Suivi du poids & reps', 'Historique filtrable'],
            },
            {
              icon: <Waves size={20} color="#60a5fa" />,
              iconBg: 'rgba(59,130,246,0.15)',
              border: 'rgba(59,130,246,0.2)',
              bg: 'rgba(59,130,246,0.05)',
              color: '#60a5fa',
              title: 'Natation',
              desc: 'Générez automatiquement des plans adaptés à votre niveau avec blocs structurés.',
              features: ['Génération selon niveau', 'Endurance, Vitesse, Technique', 'Saisie manuelle possible'],
            },
            {
              icon: <Footprints size={20} color="#34d399" />,
              iconBg: 'rgba(16,185,129,0.15)',
              border: 'rgba(16,185,129,0.2)',
              bg: 'rgba(16,185,129,0.05)',
              color: '#34d399',
              title: 'Course à pied',
              desc: 'Enregistrez vos sorties, suivez votre allure et battez vos records personnels.',
              features: ['Records 1km → Marathon', 'Allure, BPM, D+', 'Trail, Fractionné, Tempo'],
            },
          ].map(({ icon, iconBg, border, bg, color, title, desc, features }) => (
            <div key={title} style={{ borderRadius: '1.125rem', border: `1px solid ${border}`, background: bg, padding: '1.5rem' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                {icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>{desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <Check size={13} color={color} style={{ flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Extra features */}
      <section style={{ padding: '1.5rem 1.25rem', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
          {[
            { icon: <Trophy size={18} color="#fbbf24" />, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', title: 'Trophées', desc: 'Débloquez des récompenses : streaks, distances, records personnels.' },
            { icon: <TrendingUp size={18} color="#34d399" />, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', title: 'Statistiques', desc: 'Visualisez votre progression avec graphiques et analyses.' },
            { icon: <Users size={18} color="#a78bfa" />, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)', title: 'Communauté', desc: 'Fil d\'actualité partagé et profils publics.' },
          ].map(({ icon, bg, border, title, desc }) => (
            <div key={title} style={{ borderRadius: '1rem', border: `1px solid ${border}`, background: bg, padding: '1.125rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>{icon}</div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{title}</h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: '3rem 1.25rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>🏆</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.375rem', marginBottom: '0.625rem' }}>Prêt à progresser ?</h2>
          <p style={{ fontSize: '0.9375rem', color: '#94a3b8', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Gratuit, sans publicité.<br />Créez votre compte en 30 secondes.
          </p>
          <Link href="/login" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontSize: '1.0625rem', fontWeight: 800, boxShadow: '0 4px 20px rgba(59,130,246,0.25)' }}>
            Créer mon compte <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: '#475569' }}>
          © 2025 SPORTS.SL — Suivez vos performances, battez vos records.
        </p>
      </footer>
    </div>
  )
}
