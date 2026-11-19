import { Suspense } from 'react'
import CashierClient from './cashier-client'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cashier & Dispatch Portal | Chicken Town SL',
  description: 'Manage counter sales, delivery fees, settlements, and order dispatching.',
}

export default function CashierPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mb-2 text-2xl font-bold text-brand-red">🍗 Chicken Town SL</div>
            <p>Loading Cashier & Dispatch Portal...</p>
          </div>
        </div>
      }
    >
      <CashierClient />
    </Suspense>
  )
}
