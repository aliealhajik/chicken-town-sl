import type { Metadata } from 'next'
import StaffLoginClient from './login-client'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Staff Login | Chicken Town SL',
  description: 'Staff authentication portal for Chicken Town SL',
}

export default function StaffLoginPage() {
  return <StaffLoginClient />
}
