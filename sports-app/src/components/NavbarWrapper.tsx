'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

const HIDDEN_ROUTES = ['/login', '/auth/reset-password']

export default function NavbarWrapper() {
  const pathname = usePathname()
  if (HIDDEN_ROUTES.includes(pathname)) return null
  return <Navbar />
}
