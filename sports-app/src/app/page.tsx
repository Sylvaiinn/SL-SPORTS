import Link from 'next/link'
import { Dumbbell, Waves, Footprints, Trophy, TrendingUp, Users, ChevronRight, Check, Zap, Star } from 'lucide-react'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* ─── Nav ─── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white' }}>SL</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>SPORTS.SL</span>
          </div>
          <Link href="/login" style={{ textDecoration: 'none', padding: '0.5rem 1.125rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 600, display: 'inline-block' }}>
            Se connecter
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ padding: '5rem 1.5rem 3.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '99px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: '2rem' }}>
            <Zap size={12} color="#60a5fa" />
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#60a5fa' }}>Musculation · Natation · Course à pied</span>
          </div>
          <h1 style={{ fontSize: '2.875rem', fontWeight: 900, lineHeight: 1.08, marginBottom: '1.25rem', letterSpacing: '-0.025em' }}>
            L&apos;app qui suit<br />toutes vos <span style={{ color: '#60a5fa' }}>performances</span>
          </h1>
          <p style={{ fontSize: '1.0625rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Tracker de séances, générateur de plans natation, records de course et trophées — tout au même endroit. Gratuit.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontSize: '1rem', fontWeight: 700, boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>
              Commencer gratuitement <ChevronRight size={17} />
            </Link>
            <Link href="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '0.9rem 1.5rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#cbd5e1', fontSize: '1rem', fontWeight: 600 }}>
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Sports cards ─── */}
      <section style={{ padding: '0 1.5rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            {
              Icon: Dumbbell, color: '#a78bfa', border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.06)',
              title: 'Musculation', desc: 'Créez vos séances, organisez vos exercices et suivez le volume soulevé chaque semaine.',
              items: ['Templates de séances A / B / C', 'Dernier poids connu par exercice', 'Statistiques & historique complet'],
            },
            {
              Icon: Waves, color: '#60a5fa', border: 'rgba(59,130,246,0.2)', bg: 'rgba(59,130,246,0.06)',
              title: 'Natation', desc: 'Générez automatiquement un plan structuré adapté à votre niveau, style et équipement.',
              items: ['Endurance, Vitesse, Technique, Mixte', 'Échauffement + corps + récupération', 'Saisie manuelle possible'],
            },
            {
              Icon: Footprints, color: '#34d399', border: 'rgba(16,185,129,0.2)', bg: 'rgba(16,185,129,0.06)',
              title: 'Course à pied', desc: 'Enregistrez vos sorties et battez vos records sur toutes les distances clés.',
              items: ['Records auto : 1km → Marathon', 'Allure, BPM, dénivelé, cadence', 'Trail, Fractionné, Tempo, Récup'],
            },
          ].map(({ Icon, color, border, bg, title, desc, items }) => (
            <div key={title} style={{ borderRadius: '1.125rem', border: `1px solid ${border}`, background: bg, padding: '1.5rem' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={19} color={color} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1rem' }}>{desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <Check size={12} color={color} style={{ flexShrink: 0 }} />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features secondaires ─── */}
      <section style={{ padding: '0 1.5rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.875rem' }}>
          {[
            { Icon: Trophy,     color: '#fbbf24', bg: 'rgba(245,158,11,0.07)',   border: 'rgba(245,158,11,0.15)',   title: 'Trophées',        desc: 'Streaks, records, distances : débloquez des achievements au fil de vos progrès.' },
            { Icon: TrendingUp, color: '#34d399', bg: 'rgba(16,185,129,0.07)',   border: 'rgba(16,185,129,0.15)',   title: 'Statistiques',    desc: 'Graphiques hebdomadaires et vue globale de toutes vos performances.' },
            { Icon: Users,      color: '#a78bfa', bg: 'rgba(139,92,246,0.07)',   border: 'rgba(139,92,246,0.15)',   title: 'Communauté',      desc: 'Fil d\'actualité, profils publics et partage de séances avec vos amis.' },
          ].map(({ Icon, color, bg, border, title, desc }) => (
            <div key={title} style={{ borderRadius: '1rem', border: `1px solid ${border}`, background: bg, padding: '1.25rem' }}>
              <Icon size={18} color={color} style={{ marginBottom: '0.625rem', display: 'block' }} />
              <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem', color: '#f1f5f9' }}>{title}</h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Social proof ─── */}
      <section style={{ padding: '1rem 1.5rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginBottom: '0.75rem' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={18} color="#fbbf24" fill="#fbbf24" />)}
          </div>
          <p style={{ fontSize: '1.0625rem', color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 0.875rem' }}>
            &quot;Je suis mes trois sports dans la même app. Les records automatiques et les trophées me motivent vraiment à me dépasser.&quot;
          </p>
          <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>— Utilisateur SPORTS.SL</span>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section style={{ padding: '1rem 1.5rem 5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '2.5rem 2rem', borderRadius: '1.5rem', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.05)' }}>
          <div style={{ fontSize: '2.75rem', marginBottom: '0.875rem' }}>🏆</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.4375rem', marginBottom: '0.625rem', color: '#f1f5f9' }}>Prêt à progresser ?</h2>
          <p style={{ fontSize: '0.9375rem', color: '#94a3b8', marginBottom: '1.75rem', lineHeight: 1.65 }}>
            Gratuit, sans publicité.<br />Créez votre compte en 30 secondes.
          </p>
          <Link href="/login" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontSize: '1.0625rem', fontWeight: 800, boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
            Créer mon compte <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: '#334155', margin: 0 }}>
          © 2025 SPORTS.SL — Musculation · Natation · Course à pied
        </p>
      </footer>

    </div>
  )
}
