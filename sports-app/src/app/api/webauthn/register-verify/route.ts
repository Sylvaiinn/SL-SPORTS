import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

const RP_ID = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'
const ORIGIN = RP_ID === 'localhost' ? 'http://localhost:3000' : `https://${RP_ID}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const cookieStore = await cookies()
  const challenge = cookieStore.get('webauthn_reg_challenge')?.value
  if (!challenge) return NextResponse.json({ error: 'Challenge expiré' }, { status: 400 })

  const body = await req.json()

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 })
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Vérification échouée' }, { status: 400 })
  }

  const { credential } = verification.registrationInfo

  const service = createServiceClient()
  const { error } = await service.from('webauthn_credentials').upsert({
    user_id: user.id,
    credential_id: credential.id,
    public_key: Buffer.from(credential.publicKey).toString('base64'),
    counter: credential.counter,
  }, { onConflict: 'credential_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  cookieStore.delete('webauthn_reg_challenge')
  return NextResponse.json({ verified: true, credentialId: credential.id })
}
