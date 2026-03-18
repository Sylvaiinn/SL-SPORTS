import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

const RP_ID = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const service = createServiceClient()

  // Try to get email from body to find specific credentials (needed on Android)
  let allowCredentials: { id: string }[] = []
  let emailWasProvided = false

  try {
    const body = await req.json().catch(() => ({}))
    const email = body.email as string | undefined

    if (email) {
      emailWasProvided = true

      // Find user by email via admin API
      const { data: { users } } = await service.auth.admin.listUsers({ perPage: 1000 })
      const user = users.find(u => u.email === email)

      if (user) {
        const { data: creds } = await service
          .from('webauthn_credentials')
          .select('credential_id')
          .eq('user_id', user.id)

        if (creds && creds.length > 0) {
          allowCredentials = creds.map(c => ({ id: c.credential_id }))
        }
      }
    }
  } catch { /* ignore — fall back to discoverable */ }

  // If email was provided but no credentials found, return 404 so Android doesn't
  // fall back to discoverable mode (which triggers credential manager and fails on MIUI)
  if (emailWasProvided && allowCredentials.length === 0) {
    return NextResponse.json(
      { error: 'Aucune empreinte enregistrée pour cet email.' },
      { status: 404 }
    )
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'required',
    allowCredentials, // empty = discoverable (iOS), filled = non-discoverable (Android)
  })

  cookieStore.set('webauthn_auth_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300,
    path: '/',
  })

  return NextResponse.json(options)
}
