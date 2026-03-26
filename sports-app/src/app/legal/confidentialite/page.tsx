import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — SPORTS.SL',
}

const S = {
  h1: { fontSize: '1.75rem', fontWeight: 900, color: '#f1f5f9', marginBottom: '0.5rem', letterSpacing: '-0.02em' } as React.CSSProperties,
  updated: { fontSize: '0.8125rem', color: '#475569', marginBottom: '2rem', display: 'block' } as React.CSSProperties,
  h2: { fontSize: '1.0625rem', fontWeight: 800, color: '#e2e8f0', margin: '2rem 0 0.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' } as React.CSSProperties,
  h3: { fontSize: '0.9375rem', fontWeight: 700, color: '#cbd5e1', margin: '1.25rem 0 0.5rem' } as React.CSSProperties,
  p: { fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '0.75rem' } as React.CSSProperties,
  ul: { paddingLeft: '1.25rem', margin: '0.5rem 0 0.75rem' },
  li: { fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '0.25rem' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '1rem' },
  th: { padding: '0.625rem 0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', textAlign: 'left' as const, background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  td: { padding: '0.625rem 0.75rem', fontSize: '0.8125rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', verticalAlign: 'top' } as React.CSSProperties,
  tdLabel: { padding: '0.625rem 0.75rem', fontSize: '0.8125rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1', fontWeight: 600, verticalAlign: 'top' } as React.CSSProperties,
  badge: (color: string) => ({ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: `${color}22`, color: color, border: `1px solid ${color}44` }) as React.CSSProperties,
  placeholder: { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.25rem', padding: '0.1rem 0.4rem', color: '#fbbf24', fontSize: '0.8125rem', fontWeight: 600 } as React.CSSProperties,
  box: (color: string) => ({ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1rem' }) as React.CSSProperties,
}

export default function ConfidentialitePage() {
  return (
    <>
      <h1 style={S.h1}>Politique de confidentialité</h1>
      <span style={S.updated}>Dernière mise à jour : mars 2025 — Conforme RGPD (UE 2016/679)</span>

      <div style={S.box('#3b82f6')}>
        <p style={{ ...S.p, marginBottom: 0, color: '#93c5fd', fontSize: '0.875rem' }}>
          SPORTS.SL s&apos;engage à protéger vos données personnelles. Cette politique décrit de manière transparente quelles données sont collectées, pourquoi, et comment vous pouvez exercer vos droits.
        </p>
      </div>

      {/* 1. Identité du responsable */}
      <h2 style={S.h2}>1. Responsable du traitement</h2>
      <table style={S.table}>
        <tbody>
          <tr><td style={S.tdLabel}>Identité</td><td style={S.td}><span style={S.placeholder}>PRÉNOM NOM</span> — SPORTS.SL</td></tr>
          <tr><td style={S.tdLabel}>SIRET</td><td style={S.td}><span style={S.placeholder}>XXX XXX XXX XXXXX</span></td></tr>
          <tr><td style={S.tdLabel}>Contact DPO / Données</td><td style={S.td}><span style={S.placeholder}>contact@sports.sl-information.fr</span></td></tr>
        </tbody>
      </table>

      {/* 2. Données collectées */}
      <h2 style={S.h2}>2. Données collectées</h2>

      <h3 style={S.h3}>2.1 Données d&apos;identification</h3>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Donnée</th><th style={S.th}>Finalité</th><th style={S.th}>Base légale</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Adresse email</td><td style={S.td}>Authentification, notifications</td><td style={S.td}><span style={S.badge('#3b82f6')}>Contrat</span></td></tr>
          <tr><td style={S.td}>Pseudo (username)</td><td style={S.td}>Identification dans la communauté</td><td style={S.td}><span style={S.badge('#3b82f6')}>Contrat</span></td></tr>
          <tr><td style={S.td}>Photo de profil</td><td style={S.td}>Personnalisation du profil</td><td style={S.td}><span style={S.badge('#10b981')}>Consentement</span></td></tr>
          <tr><td style={S.td}>Ville, âge, biographie</td><td style={S.td}>Enrichissement du profil public</td><td style={S.td}><span style={S.badge('#10b981')}>Consentement</span></td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>2.2 Données de santé et sportives <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, marginLeft: '0.5rem' }}>Art. 9 RGPD</span></h3>
      <div style={S.box('#ef4444')}>
        <p style={{ ...S.p, marginBottom: 0, color: '#fca5a5', fontSize: '0.8125rem' }}>
          Ces données sont considérées comme des <strong>données de santé</strong> au sens du RGPD. Leur traitement repose exclusivement sur votre <strong>consentement explicite</strong> donné lors de l&apos;inscription. Vous pouvez le retirer à tout moment.
        </p>
      </div>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Donnée</th><th style={S.th}>Finalité</th><th style={S.th}>Base légale</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Poids (kg), taille (cm)</td><td style={S.td}>Suivi de progression, calcul IMC, estimation calories</td><td style={S.td}><span style={S.badge('#f59e0b')}>Consentement explicite</span></td></tr>
          <tr><td style={S.td}>Fréquence cardiaque (BPM)</td><td style={S.td}>Analyse de l&apos;intensité des séances course</td><td style={S.td}><span style={S.badge('#f59e0b')}>Consentement explicite</span></td></tr>
          <tr><td style={S.td}>Calories dépensées</td><td style={S.td}>Estimation basée sur poids × distance (algorithme interne)</td><td style={S.td}><span style={S.badge('#f59e0b')}>Consentement explicite</span></td></tr>
          <tr><td style={S.td}>Performances sportives (allure, volume, distance)</td><td style={S.td}>Suivi des progrès, records personnels, trophées</td><td style={S.td}><span style={S.badge('#f59e0b')}>Consentement explicite</span></td></tr>
          <tr><td style={S.td}>Dénivelé, cadence de course</td><td style={S.td}>Analyse détaillée des séances outdoor</td><td style={S.td}><span style={S.badge('#f59e0b')}>Consentement explicite</span></td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>2.3 Données d&apos;utilisation</h3>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Donnée</th><th style={S.th}>Finalité</th><th style={S.th}>Base légale</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Historique des séances (muscu, natation, course)</td><td style={S.td}>Fourniture du service</td><td style={S.td}><span style={S.badge('#3b82f6')}>Contrat</span></td></tr>
          <tr><td style={S.td}>Trophées débloqués</td><td style={S.td}>Gamification, motivation</td><td style={S.td}><span style={S.badge('#3b82f6')}>Contrat</span></td></tr>
          <tr><td style={S.td}>Horodatage de connexion</td><td style={S.td}>Calcul du streak, sécurité</td><td style={S.td}><span style={S.badge('#6366f1')}>Intérêt légitime</span></td></tr>
          <tr><td style={S.td}>Clés de sécurité WebAuthn (passkeys)</td><td style={S.td}>Authentification biométrique (facultatif)</td><td style={S.td}><span style={S.badge('#10b981')}>Consentement</span></td></tr>
        </tbody>
      </table>

      {/* 3. Partage des données */}
      <h2 style={S.h2}>3. Partage et sous-traitants</h2>
      <p style={S.p}>SPORTS.SL ne vend jamais vos données personnelles à des tiers. Le seul sous-traitant ayant accès à vos données est :</p>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Sous-traitant</th><th style={S.th}>Rôle</th><th style={S.th}>Garanties RGPD</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Supabase Inc.</td><td style={S.td}>Base de données, authentification, stockage fichiers</td><td style={S.td}>DPA signé — données UE stockées en Europe (Frankfurt)</td></tr>
        </tbody>
      </table>
      <p style={S.p}>Les données de profil marquées comme &laquo; publics &raquo; (pseudo, avatar, ville, trophées, séances publiques) sont visibles par les autres utilisateurs de la plateforme.</p>

      {/* 4. Durée de conservation */}
      <h2 style={S.h2}>4. Durée de conservation</h2>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Catégorie</th><th style={S.th}>Durée</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Données de compte actif</td><td style={S.td}>Pendant toute la durée de l&apos;utilisation du service</td></tr>
          <tr><td style={S.td}>Données après inactivité</td><td style={S.td}>3 ans après la dernière connexion, puis suppression automatique</td></tr>
          <tr><td style={S.td}>Données après suppression du compte</td><td style={S.td}>Suppression immédiate et définitive</td></tr>
          <tr><td style={S.td}>Logs de sécurité</td><td style={S.td}>1 an (intérêt légitime — sécurité)</td></tr>
        </tbody>
      </table>

      {/* 5. Vos droits */}
      <h2 style={S.h2}>5. Vos droits (RGPD Art. 15-22)</h2>
      <p style={S.p}>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#cbd5e1' }}>Droit d&apos;accès (Art. 15)</strong> — Obtenir une copie de toutes vos données</li>
        <li style={S.li}><strong style={{ color: '#cbd5e1' }}>Droit de rectification (Art. 16)</strong> — Corriger des données inexactes</li>
        <li style={S.li}><strong style={{ color: '#cbd5e1' }}>Droit à l&apos;effacement (Art. 17)</strong> — Supprimer votre compte et toutes vos données via la page Profil → &laquo; Supprimer mon compte &raquo;</li>
        <li style={S.li}><strong style={{ color: '#cbd5e1' }}>Droit à la portabilité (Art. 20)</strong> — Exporter vos données au format JSON/CSV (fonctionnalité Premium)</li>
        <li style={S.li}><strong style={{ color: '#cbd5e1' }}>Droit d&apos;opposition (Art. 21)</strong> — Vous opposer au traitement basé sur l&apos;intérêt légitime</li>
        <li style={S.li}><strong style={{ color: '#cbd5e1' }}>Droit de retrait du consentement</strong> — Retirer à tout moment le consentement donné pour les données de santé</li>
      </ul>
      <p style={S.p}>Pour exercer ces droits : <span style={S.placeholder}>contact@sports.sl-information.fr</span> — Réponse sous 30 jours.</p>
      <p style={S.p}>En cas de réclamation non résolue, vous pouvez saisir la <strong style={{ color: '#cbd5e1' }}>CNIL</strong> : cnil.fr/fr/plaintes</p>

      {/* 6. Cookies */}
      <h2 style={S.h2}>6. Cookies et traceurs</h2>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Cookie</th><th style={S.th}>Type</th><th style={S.th}>Finalité</th><th style={S.th}>Durée</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>sb-access-token</td><td style={S.td}><span style={S.badge('#3b82f6')}>Nécessaire</span></td><td style={S.td}>Session d&apos;authentification Supabase</td><td style={S.td}>1 heure (renouvelé automatiquement)</td></tr>
          <tr><td style={S.td}>sb-refresh-token</td><td style={S.td}><span style={S.badge('#3b82f6')}>Nécessaire</span></td><td style={S.td}>Renouvellement de session</td><td style={S.td}>7 jours</td></tr>
        </tbody>
      </table>
      <p style={S.p}>Aucun cookie publicitaire, de tracking ou d&apos;analyse tiers n&apos;est déposé. Si des outils d&apos;analytics sont ajoutés à l&apos;avenir, votre consentement sera demandé préalablement.</p>

      {/* 7. Sécurité */}
      <h2 style={S.h2}>7. Sécurité des données</h2>
      <p style={S.p}>SPORTS.SL met en œuvre les mesures techniques et organisationnelles suivantes :</p>
      <ul style={S.ul}>
        <li style={S.li}>Chiffrement des mots de passe (bcrypt via Supabase Auth)</li>
        <li style={S.li}>Authentification biométrique par clés de sécurité FIDO2/WebAuthn (facultatif)</li>
        <li style={S.li}>Connexion HTTPS/TLS pour tous les échanges</li>
        <li style={S.li}>Politique de Row Level Security (RLS) sur toutes les tables Supabase</li>
        <li style={S.li}>Accès aux données restreint au seul responsable du traitement</li>
      </ul>

      {/* 8. Modifications */}
      <h2 style={S.h2}>8. Modifications de cette politique</h2>
      <p style={S.p}>En cas de modification substantielle, vous serez informé par email au moins 30 jours avant l&apos;entrée en vigueur des changements. La date de dernière mise à jour est indiquée en haut de cette page.</p>
    </>
  )
}
