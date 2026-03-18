'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X, ChevronRight, ChevronLeft,
  Dumbbell, Waves, Footprints, Trophy, BarChart2, User, Zap,
} from 'lucide-react'

interface Step {
  title: string
  subtitle: string
  description: string
  features: { icon: string; text: string }[]
  gradient: string
  accentColor: string
  heroIcon: React.ReactNode
  tip?: string
}

const STEPS: Step[] = [
  {
    title: 'Bienvenue sur SPORTS.SL',
    subtitle: 'Votre coach sportif personnel',
    description: 'Suivez toutes vos activités sportives en un seul endroit. Musculation, natation, course — tout est centralisé.',
    features: [
      { icon: '💪', text: 'Séances de musculation complètes' },
      { icon: '🏊', text: 'Plans de natation générés' },
      { icon: '🏃', text: 'Suivi de course détaillé' },
      { icon: '🏆', text: 'Trophées & progression de niveau' },
    ],
    gradient: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)',
    accentColor: '#818cf8',
    heroIcon: <Dumbbell size={44} color="white" />,
  },
  {
    title: 'Dashboard',
    subtitle: 'Vue d\'ensemble de votre activité',
    description: 'Le tableau de bord centralise toutes vos statistiques, votre streak de jours actifs et votre calendrier mensuel.',
    features: [
      { icon: '🔥', text: 'Streak : vos jours d\'activité consécutifs' },
      { icon: '📊', text: 'Compteurs Muscu / Natation / Course' },
      { icon: '📅', text: 'Calendrier mensuel avec points colorés' },
      { icon: '⚡', text: 'Accès rapide à chaque discipline' },
    ],
    gradient: 'linear-gradient(160deg, #0c1a3a 0%, #1e3a5f 60%, #0e2240 100%)',
    accentColor: '#60a5fa',
    heroIcon: <BarChart2 size={44} color="white" />,
    tip: 'Le calendrier affiche 🟣 muscu · 🔵 natation · 🟢 course pour chaque jour actif.',
  },
  {
    title: 'Musculation',
    subtitle: 'Suivi des séances de force',
    description: 'Créez des séances personnalisées, suivez exercices et séries, analysez votre progression et partagez des templates.',
    features: [
      { icon: '➕', text: 'Nouvelle séance avec chrono et minuteur de repos' },
      { icon: '📋', text: 'Templates A/B/C et bibliothèque communautaire' },
      { icon: '📈', text: 'Graphiques radar muscles + progression poids' },
      { icon: '✏️', text: 'Modifier, dupliquer ou rendre une séance publique' },
    ],
    gradient: 'linear-gradient(160deg, #1a0533 0%, #2d1060 55%, #1e0a40 100%)',
    accentColor: '#a78bfa',
    heroIcon: <Dumbbell size={44} color="white" />,
    tip: 'Rendez une séance publique pour qu\'elle apparaisse sur votre profil.',
  },
  {
    title: 'Natation',
    subtitle: 'Plans de natation générés',
    description: 'Générez automatiquement un plan structuré adapté à votre niveau, votre style et la distance souhaitée.',
    features: [
      { icon: '🎯', text: 'Styles : Endurance · Vitesse · Technique · Mixte' },
      { icon: '📏', text: 'Distance de 1 000 m à 3 500 m et plus' },
      { icon: '⚙️', text: 'Niveaux : Débutant · Intermédiaire · Avancé' },
      { icon: '🦈', text: 'Équipements : palmes · pull-buoy · planche' },
    ],
    gradient: 'linear-gradient(160deg, #0c1f45 0%, #1a3a6e 55%, #0d2040 100%)',
    accentColor: '#38bdf8',
    heroIcon: <Waves size={44} color="white" />,
    tip: 'Chaque plan comprend échauffement, corps de séance et récupération détaillés.',
  },
  {
    title: 'Course à pied',
    subtitle: 'Suivi complet de running',
    description: 'Enregistrez chaque run avec allure, fréquence cardiaque, dénivelé, chaussures et bien plus encore.',
    features: [
      { icon: '⏱️', text: 'Allure auto-calculée + allure min/max' },
      { icon: '❤️', text: 'BPM moyen, max et au repos' },
      { icon: '🏅', text: 'Records personnels par distance (5K, 10K, semi, marathon)' },
      { icon: '👟', text: 'Gestion des chaussures avec km cumulés + alerte usure' },
    ],
    gradient: 'linear-gradient(160deg, #052e16 0%, #14532d 55%, #052820 100%)',
    accentColor: '#34d399',
    heroIcon: <Footprints size={44} color="white" />,
    tip: 'Une alerte apparaît automatiquement quand une paire dépasse 700 km.',
  },
  {
    title: 'Trophées & Niveaux',
    subtitle: 'Système de gamification',
    description: 'Atteignez des objectifs pour débloquer des trophées et progresser de Débutant à Elite.',
    features: [
      { icon: '🎖️', text: '11 trophées débloqués automatiquement' },
      { icon: '⬆️', text: '5 niveaux : Débutant → Intermédiaire → Confirmé → Expert → Elite' },
      { icon: '🌟', text: 'Votre niveau apparaît sur votre profil public' },
      { icon: '👀', text: 'Trophées récents de la communauté sur le dashboard' },
    ],
    gradient: 'linear-gradient(160deg, #2d1b00 0%, #451a03 55%, #1c1000 100%)',
    accentColor: '#fbbf24',
    heroIcon: <Trophy size={44} color="white" />,
    tip: 'Faites des séances régulièrement pour monter de niveau rapidement.',
  },
  {
    title: 'Profil & Communauté',
    subtitle: 'Votre identité sportive',
    description: 'Personnalisez votre profil avec photo et bannière. Rendez-le public pour rejoindre la communauté.',
    features: [
      { icon: '📸', text: 'Photo de profil et bannière personnalisées' },
      { icon: '🔒', text: 'Contrôle public/privé total de votre profil' },
      { icon: '🔍', text: 'Recherchez d\'autres athlètes via la navbar' },
      { icon: '🌐', text: 'Page publique avec stats, trophées et séances' },
    ],
    gradient: 'linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #111827 100%)',
    accentColor: '#94a3b8',
    heroIcon: <User size={44} color="white" />,
    tip: 'Le 🔍 dans la barre de navigation permet de trouver d\'autres athlètes.',
  },
  {
    title: 'C\'est parti !',
    subtitle: 'Vous êtes prêt à vous entraîner',
    description: 'Toutes les fonctionnalités sont disponibles. Commencez dès maintenant et suivez votre progression !',
    features: [
      { icon: '1️⃣', text: 'Créez votre première séance de musculation' },
      { icon: '2️⃣', text: 'Générez un plan de natation' },
      { icon: '3️⃣', text: 'Enregistrez votre premier run' },
      { icon: '4️⃣', text: 'Complétez votre profil' },
    ],
    gradient: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 40%, #1a1040 100%)',
    accentColor: '#818cf8',
    heroIcon: <Zap size={44} color="white" />,
  },
]

interface TutorialProps {
  onClose: () => void
}

export default function Tutorial({ onClose }: TutorialProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const goTo = useCallback((nextStep: number) => {
    setVisible(false)
    setTimeout(() => {
      setStep(nextStep)
      setVisible(true)
    }, 180)
  }, [])

  const next = useCallback(() => {
    if (isLast) { onClose(); return }
    goTo(step + 1)
  }, [isLast, step, goTo, onClose])

  const prev = useCallback(() => {
    if (isFirst) return
    goTo(step - 1)
  }, [isFirst, step, goTo])

  // Bloc du scroll en arrière-plan
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev, onClose])

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '480px',
          maxHeight: 'calc(100vh - 2rem)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          opacity: 1,
        }}
      >
        {/* Hero — compact */}
        <div style={{ position: 'relative', background: current.gradient, padding: '1.5rem 1.25rem 1.25rem', flexShrink: 0 }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          {/* Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', background: current.accentColor, width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.4s ease', boxShadow: `0 0 8px ${current.accentColor}` }} />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '0.875rem', right: '0.875rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '0.5rem', width: '2rem', height: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', zIndex: 2 }}
            title="Fermer le tutoriel"
          >
            <X size={16} />
          </button>

          {/* Step content */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem', opacity: visible ? 1 : 0, transition: 'opacity 0.18s ease' }}>
            {/* Icon */}
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(4px)' }}>
              {current.heroIcon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: current.accentColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                {current.subtitle}
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '0.3rem' }}>
                {current.title}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
                {current.description}
              </p>
            </div>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: current.tip ? '0.875rem' : '1.25rem', opacity: visible ? 1 : 0, transition: 'opacity 0.18s ease' }}>
            {current.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {current.tip && (
            <div style={{ padding: '0.625rem 0.75rem', borderRadius: '0.625rem', background: `${current.accentColor}15`, border: `1px solid ${current.accentColor}30`, marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', opacity: visible ? 1 : 0, transition: 'opacity 0.18s ease' }}>
              <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: '0.78rem', color: current.accentColor, lineHeight: 1.5 }}>{current.tip}</p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.625rem' }}>
            <button
              onClick={prev}
              disabled={isFirst}
              style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.3 : 1, transition: 'all 0.2s', flexShrink: 0, color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{ width: i === step ? '1.25rem' : '0.4rem', height: '0.4rem', borderRadius: '999px', background: i === step ? current.accentColor : 'var(--border)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease', boxShadow: i === step ? `0 0 6px ${current.accentColor}80` : 'none' }}
                />
              ))}
            </div>

            <button
              onClick={next}
              style={{ padding: '0 1.125rem', height: '2.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700, background: current.accentColor, color: '#0a0a0f', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s', flexShrink: 0, boxShadow: `0 0 16px ${current.accentColor}40` }}
            >
              {isLast ? 'Commencer 🚀' : 'Suivant'}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.875rem' }}>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.725rem', fontFamily: 'inherit' }}
            >
              Passer le tutoriel · {step + 1}/{STEPS.length}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
