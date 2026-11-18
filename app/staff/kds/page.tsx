import { Metadata } from 'next'
import { Suspense } from 'react'
import { KdsClient } from './kds-client'

export const metadata: Metadata = {
  title: 'Kitchen Display System (KDS) | Chicken Town SL',
  description:
    'Live kitchen ticket display, one-tap ticket bumping, audio alerts, and table runner coordination for Chicken Town SL.',
}

export default function KdsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal text-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-white/70">
              Loading Kitchen Display System...
            </p>
          </div>
        </div>
      }
    >
      <KdsClient />
    </Suspense>
  )
}
