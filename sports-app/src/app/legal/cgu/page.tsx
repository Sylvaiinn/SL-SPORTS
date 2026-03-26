import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — SPORTS.SL',
}

const S = {
  h1: { fontSize: '1.75rem', fontWeight: 900, color: '#f1f5f9', marginBottom: '0.5rem', letterSpacing: '-0.02em' } as React.CSSProperties,
  updated: { fontSize: '0.8125rem', color: '#475569', marginBottom: '2rem', display: 'block' } as React.CSSProperties,
  h2: { fontSize: '1.0625rem', fontWeight: 800, color: '#e2e8f0', margin: '2rem 0 0.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' } as React.CSSProperties,
  p: { fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '0.75rem' } as React.CSSProperties,
  ul: { paddingLeft: '1.25rem', margin: '0.5rem 0 0.75rem' },
  li: { fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '0.25rem' } as React.CSSProperties,
  placeholder: { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.25rem', padding: '0.1rem 0.4rem', color: '#fbbf24', fontSize: '0.8125rem', fontWeight: 600 } as React.CSSProperties,
  box: (color: string) => ({ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1rem' }) as React.CSSProperties,
}

export default function CguPage() {
  return (
    <>
      <h1 style={S.h1}>Conditions Générales d&apos;Utilisation</h1>
      <span style={S.updated}>Dernière mise à jour : mars 2025 — Version 1.0</span>

      <div style={S.box('#3b82f6')}>
        <p style={{ ...S.p, marginBottom: 0, color: '#93c5fd', fontSize: '0.875rem' }}>
          En créant un compte sur SPORTS.SL, vous acceptez les présentes CGU dans leur intégralité. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le service.
        </p>
      </div>

      <h2 style={S.h2}>1. Présentation du service</h2>
      <p style={S.p}>SPORTS.SL est une application web de suivi sportif permettant de consigner et analyser des séances de <strong style={{ color: '#e2e8f0' }}>musculation</strong>, <strong style={{ color: '#e2e8f0' }}>natation</strong> et <strong style={{ color: '#e2e8f0' }}>course à pied</strong>. Le service comprend notamment :</p>
      <ul style={S.ul}>
        <li style={S.li}>L&apos;enregistrement de séances sportives et de données de performance</li>
        <li style={S.li}>Un générateur de plans de natation</li>
        <li style={S.li}>Le suivi de records personnels et de progrès</li>
        <li style={S.li}>Un système de trophées et de niveaux (gamification)</li>
        <li style={S.li}>Un fil d&apos;actualité social (partage de séances entre utilisateurs)</li>
        <li style={S.li}>Un profil public optionnel</li>
      </ul>
      <p style={S.p}>Le service est édité par <span style={S.placeholder}>PRÉNOM NOM</span> en tant que micro-entrepreneur. Il n&apos;est <strong style={{ color: '#f87171' }}>pas un service médical</strong> et ne constitue en aucun cas un suivi médical, un diagnostic ou un conseil médical.</p>

      <h2 style={S.h2}>2. Accès au service</h2>
      <h3 style={{ ...S.p, fontWeight: 700, color: '#cbd5e1', margin: '1rem 0 0.5rem' }}>2.1 Offre gratuite</h3>
      <p style={S.p}>SPORTS.SL propose un accès gratuit permanent incluant les fonctionnalités de base (dashboard, 3 sports, 50 séances par sport, 5 trophées, fil d&apos;actualité, profil public).</p>
      <h3 style={{ ...S.p, fontWeight: 700, color: '#cbd5e1', margin: '1rem 0 0.5rem' }}>2.2 Offre Premium</h3>
      <p style={S.p}>Des fonctionnalités avancées sont disponibles via un abonnement payant (historique illimité, statistiques détaillées, plans d&apos;entraînement, export de données). Les tarifs sont précisés sur la page <Link href="/upgrade" style={{ color: '#60a5fa' }}>/upgrade</Link>. Le paiement est traité par Stripe Inc. et soumis à ses propres conditions.</p>
      <p style={S.p}>Conformément à l&apos;article L.221-18 du Code de la consommation, vous bénéficiez d&apos;un <strong style={{ color: '#e2e8f0' }}>droit de rétractation de 14 jours</strong> à compter de la souscription. Pour l&apos;exercer : <span style={S.placeholder}>contact@sports.sl-information.fr</span></p>

      <h2 style={S.h2}>3. Création et sécurité du compte</h2>
      <ul style={S.ul}>
        <li style={S.li}>Vous devez avoir <strong style={{ color: '#e2e8f0' }}>au moins 16 ans</strong> pour créer un compte (âge minimum RGPD en France).</li>
        <li style={S.li}>Vous êtes responsable de la confidentialité de vos identifiants.</li>
        <li style={S.li}>Vous vous engagez à fournir des informations exactes lors de l&apos;inscription.</li>
        <li style={S.li}>Un seul compte par utilisateur est autorisé.</li>
        <li style={S.li}>En cas de compromission de votre compte, vous devez nous en informer immédiatement à <span style={S.placeholder}>contact@sports.sl-information.fr</span></li>
      </ul>

      <h2 style={S.h2}>4. Contenu utilisateur et règles communautaires</h2>
      <p style={S.p}>En utilisant les fonctionnalités sociales (profil public, partage de séances, fil d&apos;actualité), vous vous engagez à :</p>
      <ul style={S.ul}>
        <li style={S.li}>Ne partager que des informations sportives vous concernant personnellement</li>
        <li style={S.li}>Respecter les autres utilisateurs dans les espaces partagés</li>
        <li style={S.li}>Ne pas publier de contenu trompeur, offensant, illégal ou portant atteinte à des tiers</li>
        <li style={S.li}>Ne pas tenter de collecter des données sur d&apos;autres utilisateurs</li>
      </ul>
      <p style={S.p}>SPORTS.SL se réserve le droit de supprimer tout contenu non conforme et de suspendre les comptes en infraction, sans préavis.</p>

      <h2 style={S.h2}>5. Propriété intellectuelle</h2>
      <p style={S.p}>Le code source, le design, les textes et les algorithmes de SPORTS.SL sont la propriété de <span style={S.placeholder}>PRÉNOM NOM</span>. Les données sportives saisies par l&apos;utilisateur restent sa propriété exclusive. SPORTS.SL ne revendique aucun droit sur vos données personnelles.</p>

      <h2 style={S.h2}>6. Limitation de responsabilité</h2>
      <div style={S.box('#ef4444')}>
        <p style={{ ...S.p, marginBottom: 0, color: '#fca5a5', fontSize: '0.875rem' }}>
          SPORTS.SL est un outil de suivi sportif à usage personnel. Les estimations (calories, allure cible, volumes) sont indicatives et ne constituent en aucun cas des recommandations médicales. Consultez un professionnel de santé avant tout programme d&apos;entraînement intensif.
        </p>
      </div>
      <p style={S.p}>SPORTS.SL ne peut être tenu responsable de :</p>
      <ul style={S.ul}>
        <li style={S.li}>Interruptions de service liées à des opérations de maintenance ou à des événements indépendants de notre volonté</li>
        <li style={S.li}>Perte de données due à une défaillance technique imprévisible</li>
        <li style={S.li}>Blessures ou problèmes de santé résultant d&apos;un programme d&apos;entraînement suivi via l&apos;application</li>
        <li style={S.li}>Actions d&apos;autres utilisateurs sur les espaces communautaires</li>
      </ul>

      <h2 style={S.h2}>7. Résiliation du compte</h2>
      <p style={S.p}><strong style={{ color: '#e2e8f0' }}>Par l&apos;utilisateur :</strong> Vous pouvez supprimer votre compte à tout moment depuis votre page Profil → &laquo; Supprimer mon compte &raquo;. Cette action entraîne la suppression immédiate et définitive de toutes vos données.</p>
      <p style={S.p}><strong style={{ color: '#e2e8f0' }}>Par SPORTS.SL :</strong> Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, avec un préavis de 7 jours sauf comportement frauduleux ou illégal avéré.</p>
      <p style={S.p}>En cas de résiliation, les abonnements Premium en cours sont remboursés au prorata de la période non consommée.</p>

      <h2 style={S.h2}>8. Modifications des CGU</h2>
      <p style={S.p}>SPORTS.SL se réserve le droit de modifier les présentes CGU. Toute modification substantielle sera notifiée par email avec un préavis de <strong style={{ color: '#e2e8f0' }}>30 jours</strong>. La poursuite de l&apos;utilisation du service après ce délai vaut acceptation des nouvelles conditions.</p>

      <h2 style={S.h2}>9. Droit applicable et litiges</h2>
      <p style={S.p}>Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux du ressort de <span style={S.placeholder}>VOTRE VILLE</span> seront compétents.</p>
      <p style={S.p}>Médiation : tout consommateur peut recourir gratuitement à un médiateur de la consommation. <span style={S.placeholder}>Coordonnées du médiateur à compléter</span>.</p>

      <h2 style={S.h2}>10. Contact</h2>
      <p style={S.p}>Pour toute question relative aux présentes CGU : <span style={S.placeholder}>contact@sports.sl-information.fr</span></p>
      <p style={S.p}>Voir également notre <Link href="/legal/confidentialite" style={{ color: '#60a5fa' }}>Politique de confidentialité</Link> et nos <Link href="/legal/mentions-legales" style={{ color: '#60a5fa' }}>Mentions légales</Link>.</p>
    </>
  )
}
