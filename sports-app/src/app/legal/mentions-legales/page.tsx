import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — SPORTS.SL',
}

const S = {
  h1: { fontSize: '1.75rem', fontWeight: 900, color: '#f1f5f9', marginBottom: '0.5rem', letterSpacing: '-0.02em' } as React.CSSProperties,
  updated: { fontSize: '0.8125rem', color: '#475569', marginBottom: '2.5rem', display: 'block' } as React.CSSProperties,
  h2: { fontSize: '1.0625rem', fontWeight: 800, color: '#e2e8f0', margin: '2rem 0 0.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' } as React.CSSProperties,
  p: { fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '0.75rem' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '1rem' },
  td: { padding: '0.625rem 0.75rem', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', verticalAlign: 'top' } as React.CSSProperties,
  tdLabel: { padding: '0.625rem 0.75rem', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1', fontWeight: 600, width: '35%', verticalAlign: 'top' } as React.CSSProperties,
  siret: { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '0.25rem', padding: '0.1rem 0.4rem', color: '#fbbf24', fontSize: '0.8125rem', fontStyle: 'italic' } as React.CSSProperties,
}

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 style={S.h1}>Mentions légales</h1>
      <span style={S.updated}>Dernière mise à jour : mars 2025</span>

      <h2 style={{ ...S.h2, borderTop: 'none', paddingTop: 0, marginTop: 0 }}>1. Éditeur du site</h2>
      <p style={S.p}>Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique, il est précisé aux utilisateurs du site l&apos;identité des différents intervenants dans le cadre de sa réalisation et de son suivi.</p>
      <table style={S.table}>
        <tbody>
          <tr><td style={S.tdLabel}>Nom / Raison sociale</td><td style={S.td}>Sylvain LECLERC — SL-INFORMATION</td></tr>
          <tr><td style={S.tdLabel}>Statut juridique</td><td style={S.td}>Micro-entrepreneur (auto-entrepreneur)</td></tr>
          <tr><td style={S.tdLabel}>SIRET</td><td style={S.td}><span style={S.siret}>En cours d&apos;immatriculation</span></td></tr>
          <tr><td style={S.tdLabel}>Ville</td><td style={S.td}>Strasbourg (67)</td></tr>
          <tr><td style={S.tdLabel}>Contact</td><td style={S.td}>s.leclerc789@gmail.com</td></tr>
          <tr><td style={S.tdLabel}>Directeur de publication</td><td style={S.td}>Sylvain LECLERC</td></tr>
        </tbody>
      </table>

      <h2 style={S.h2}>2. Hébergement</h2>
      <table style={S.table}>
        <tbody>
          <tr><td style={S.tdLabel}>Type</td><td style={S.td}>Infrastructure privée auto-hébergée (VMware ESXi)</td></tr>
          <tr><td style={S.tdLabel}>Localisation</td><td style={S.td}>France</td></tr>
          <tr><td style={S.tdLabel}>Base de données</td><td style={S.td}>Supabase — données stockées dans l&apos;Union Européenne (Frankfurt)</td></tr>
          <tr><td style={S.tdLabel}>Proxy / CDN</td><td style={S.td}>NGINX (auto-hébergé)</td></tr>
        </tbody>
      </table>
      <p style={S.p}>Supabase dispose d&apos;un accord de traitement des données (DPA) conforme au RGPD. Les données des utilisateurs européens sont stockées dans des centres de données situés dans l&apos;Union Européenne.</p>

      <h2 style={S.h2}>3. Propriété intellectuelle</h2>
      <p style={S.p}>L&apos;ensemble du contenu présent sur le site SPORTS.SL (textes, graphismes, logotypes, icônes, sons, logiciels) est la propriété exclusive de Sylvain LECLERC — SL-INFORMATION, sauf mention contraire. Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, est strictement interdite sans l&apos;accord écrit préalable.</p>

      <h2 style={S.h2}>4. Données personnelles</h2>
      <p style={S.p}>Le traitement des données à caractère personnel est décrit dans la <Link href="/legal/confidentialite" style={{ color: '#60a5fa' }}>Politique de confidentialité</Link>. Conformément au RGPD (Règlement UE 2016/679), vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données.</p>
      <p style={S.p}>Pour exercer ces droits, contactez : s.leclerc789@gmail.com</p>

      <h2 style={S.h2}>5. Cookies</h2>
      <p style={S.p}>SPORTS.SL utilise uniquement des cookies strictement nécessaires au fonctionnement du service (gestion de session d&apos;authentification via Supabase). Ces cookies ne nécessitent pas de consentement préalable car ils sont indispensables à la fourniture du service explicitement demandé par l&apos;utilisateur.</p>
      <p style={S.p}>Aucun cookie de traçage, de publicité ou d&apos;analyse tiers n&apos;est déposé sans consentement préalable.</p>

      <h2 style={S.h2}>6. Liens hypertextes</h2>
      <p style={S.p}>Le site peut contenir des liens vers d&apos;autres sites internet. SPORTS.SL n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques en matière de protection des données.</p>

      <h2 style={S.h2}>7. Droit applicable</h2>
      <p style={S.p}>Les présentes mentions légales sont soumises au droit français. En cas de litige, et après échec de toute tentative de résolution amiable, les tribunaux compétents du ressort de Strasbourg seront seuls compétents.</p>
    </>
  )
}
