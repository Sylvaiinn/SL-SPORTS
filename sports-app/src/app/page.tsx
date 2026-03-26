import Link from 'next/link'
import { Dumbbell, Waves, Footprints, Trophy, TrendingUp, Users, Zap, ChevronRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'white' }}>SL</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>SPORTS.SL</span>
          </div>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '0.5rem 1.125rem', borderRadius: '0.625rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              Se connecter
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '4rem 1.25rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '100px', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50px', right: '5%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '99px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: '1.5rem' }}>
            <Zap size={13} color="#60a5fa" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa' }}>Musculation · Natation · Course à pied</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Suivez toutes vos{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              performances
            </span>{' '}
            sportives
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.1875rem)', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Une application tout-en-un pour tracker vos séances de musculation, générer des plans de natation et analyser vos runs. Débloquez des trophées et progressez chaque semaine.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 24px rgba(59,130,246,0.35)' }}>
                Commencer gratuitement <ChevronRight size={18} />
              </button>
            </Link>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.5rem', borderRadius: '0.875rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                Se connecter
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sports cards ── */}
      <section style={{ padding: '2.5rem 1.25rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

          {/* Musculation */}
          <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(139,92,246,0.25)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(10,10,15,0))', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Dumbbell size={18} color="#a78bfa" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Musculation</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Créez vos séances, organisez vos exercices par groupes musculaires et suivez le volume soulevé semaine par semaine.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {['Templates de séances A/B/C', 'Suivi du poids par exercice', 'Historique complet avec filtres'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Check size={13} color="#a78bfa" style={{ flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Natation */}
          <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(59,130,246,0.25)', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(10,10,15,0))', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Waves size={18} color="#60a5fa" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Natation</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Générez automatiquement des plans de natation adaptés à votre niveau avec échauffement, corps de séance et récupération.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {['Génération IA selon niveau & style', 'Endurance, Vitesse, Technique, Mixte', 'Saisie manuelle & historique'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Check size={13} color="#60a5fa" style={{ flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Course */}
          <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(16,185,129,0.25)', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(10,10,15,0))', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Footprints size={18} color="#34d399" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Course à pied</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Enregistrez vos sorties, suivez votre allure et battez vos records personnels sur 1km, 5km, 10km, semi et marathon.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {['Records personnels automatiques', 'Endurance, Trail, Fractionné, Tempo', 'Stats avancées : allure, BPM, D+'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Check size={13} color="#34d399" style={{ flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Features row ── */}
      <section style={{ padding: '2rem 1.25rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { icon: <Trophy size={18} color="#fbbf24" />, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', title: 'Trophées & Achievements', desc: 'Débloquez des récompenses en atteignant vos objectifs : streaks, distances, records.' },
            { icon: <TrendingUp size={18} color="#34d399" />, bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', title: 'Statistiques avancées', desc: 'Visualisez votre progression avec des graphiques et des analyses hebdomadaires.' },
            { icon: <Users size={18} color="#a78bfa" />, bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', title: 'Communauté', desc: 'Suivez les performances de vos amis dans le fil d\'actualité et comparez vos profils.' },
          ].map(({ icon, bg, border, title, desc }) => (
            <div key={title} style={{ borderRadius: '1rem', border: `1px solid ${border}`, background: bg, padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.625rem' }}>{icon}</div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>{title}</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ padding: '3rem 1.25rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>🏆</div>
              <h2 style={{ fontWeight: 900, fontSize: '1.375rem', marginBottom: '0.625rem', color: 'var(--text-primary)' }}>Prêt à progresser ?</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Gratuit, sans publicité. Créez votre compte en 30 secondes.
              </p>
              <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
                <button style={{ width: '100%', padding: '1rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontFamily: 'inherit', fontSize: '1.0625rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  Créer mon compte <ChevronRight size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} SPORTS.SL — Suivez vos performances, battez vos records.
        </p>
      </footer>
    </div>
  )
}
