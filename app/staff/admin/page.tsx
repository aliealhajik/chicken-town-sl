import type { Metadata } from 'next'
import AdminClient from './admin-client'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Super Admin Portal | Chicken Town SL',
  description: 'Global menu management, staff profiles, multi-branch consolidated sales analytics, and table QR stand cards.',
}

export default function StaffAdminPage() {
  return <AdminClient />
}
