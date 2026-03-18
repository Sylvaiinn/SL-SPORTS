import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

const RP_ID = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'
const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const challenge = cookieStore.get('webauthn_auth_challenge')?.value
  if (!challenge) return NextResponse.json({ error: 'Challenge expiré' }, { status: 400 })

  const body = await req.json()
  const service = createServiceClient()

  // Find the credential in DB
  const { data: cred } = await service
    .from('webauthn_credentials')
    .select('*')
    .eq('credential_id', body.id)
    .single()

  if (!cred) return NextResponse.json({ error: 'Identifiant inconnu' }, { status: 404 })

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
    return NextResponse.json({ error: String(e) }, { status: 400 })
  }

  if (!verification.verified) {
    return NextResponse.json({ error: 'Vérification échouée' }, { status: 400 })
  }

  // Update counter
  await service
    .from('webauthn_credentials')
    .update({ counter: verification.authenticationInfo.newCounter })
    .eq('credential_id', cred.credential_id)

  // Create a Supabase session for this user via admin API
  const { data: sessionData, error: sessionError } = await service.auth.admin.createSession({
    user_id: cred.user_id,
  })

  if (sessionError || !sessionData.session) {
    return NextResponse.json({ error: 'Impossible de créer la session' }, { status: 500 })
  }

  cookieStore.delete('webauthn_auth_challenge')

  return NextResponse.json({
    verified: true,
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  })
}
