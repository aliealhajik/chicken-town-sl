import { Suspense } from 'react'
import type { Metadata } from 'next'
import OrderClient from './order-client'

export const metadata: Metadata = {
  title: 'Order Online | Chicken Town SL',
  description: 'Order hot & fresh fried chicken, wings, jollof rice, and meal deals in Freetown, Sierra Leone. Fast delivery from 392 or pickup from 7 branches.',
}

function OrderPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-red border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
          Loading Chicken Town Menu…
        </p>
      </div>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<OrderPageFallback />}>
      <OrderClient />
    </Suspense>
  )
}
