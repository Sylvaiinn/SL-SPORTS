import { NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

const RP_ID = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'

export async function POST() {
  // Use discoverable credentials (allowCredentials empty) so the user
  // just taps the fingerprint sensor without typing their email first.
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'required',
    allowCredentials: [],
  })

  const cookieStore = await cookies()
  cookieStore.set('webauthn_auth_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300,
    path: '/',
  })

  // Suppress unused-variable warning
  void createServiceClient

  return NextResponse.json(options)
}
