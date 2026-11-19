import type { Metadata } from 'next'
import StaffClient from './staff-client'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Staff Operations Portal | Chicken Town SL',
  description: 'Branch staff navigation and operations portal',
}

export default function StaffPage() {
  return <StaffClient />
}
