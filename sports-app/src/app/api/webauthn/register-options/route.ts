import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const RP_ID = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: existing } = await supabase
    .from('webauthn_credentials')
    .select('credential_id')
    .eq('user_id', user.id)

  const options = await generateRegistrationOptions({
    rpName: 'SPORTS.SL',
    rpID: RP_ID,
    userName: user.email ?? user.id,
    userDisplayName: user.email ?? 'Utilisateur',
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },
    excludeCredentials: (existing ?? []).map(c => ({ id: c.credential_id })),
  })

  const cookieStore = await cookies()
  cookieStore.set('webauthn_reg_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300,
    path: '/',
  })

  return NextResponse.json(options)
}
