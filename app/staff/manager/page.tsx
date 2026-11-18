import { Metadata } from 'next'
import { Suspense } from 'react'
import ManagerClient from './manager-client'

export const metadata: Metadata = {
  title: 'Branch Manager Dashboard | Chicken Town SL',
  description: 'Manage branch item stock availability, live shift accounting, and End-of-Day (EOD) Z-Reports.',
}

export default function ManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-400">Loading Branch Manager Portal...</p>
          </div>
        </div>
      }
    >
      <ManagerClient />
    </Suspense>
  )
}
