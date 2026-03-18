import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

const RP_ID = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'
const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const challenge = cookieStore.get('webauthn_auth_challenge')?.value
  if (!challenge) return NextResponse.json({ error: 'Challenge expiré, réessaie' }, { status: 400 })

  const body = await req.json()
  const service = createServiceClient()

  // Find credential in DB
  const { data: cred, error: credError } = await service
    .from('webauthn_credentials')
    .select('*')
    .eq('credential_id', body.id)
    .single()

  if (credError || !cred) {
    return NextResponse.json({ error: 'Identifiant inconnu — enregistre l\'empreinte depuis ton profil' }, { status: 404 })
  }

  // Verify WebAuthn assertion
  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: cred.credential_id,
        publicKey: Buffer.from(cred.public_key, 'base64'),
        counter: cred.counter,
      },
      requireUserVerification: true,
    })
  } catch (e) {
    return NextResponse.json({ error: `Vérification échouée : ${String(e)}` }, { status: 400 })
  }

  if (!verification.verified) {
    return NextResponse.json({ error: 'Vérification biométrique refusée' }, { status: 400 })
  }

  // Update counter
  await service
    .from('webauthn_credentials')
    .update({ counter: verification.authenticationInfo.newCounter })
    .eq('credential_id', cred.credential_id)

  // Get user email to generate magic link
  const { data: userData, error: userError } = await service.auth.admin.getUserById(cred.user_id)
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  // Generate a one-time magic link that will set the session via redirect
  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email: userData.user.email,
    options: {
      redirectTo: `${ORIGIN}/auth/callback`,
    },
  })
  if (linkError || !linkData) {
    return NextResponse.json({ error: linkError?.message ?? 'Impossible de créer la session' }, { status: 500 })
  }

  cookieStore.delete('webauthn_auth_challenge')

  return NextResponse.json({
    verified: true,
    action_link: linkData.properties.action_link,
  })
}
