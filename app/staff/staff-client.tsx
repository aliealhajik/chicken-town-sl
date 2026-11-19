'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UtensilsCrossed,
  Receipt,
  BarChart3,
  ShieldAlert,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { useStaffStore, canAccessKds, canAccessCashier, canAccessManager, canAccessAdmin } from '@/lib/staff-auth'

export default function StaffClient() {
  const router = useRouter()
  const { currentStaff } = useStaffStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    if (!currentStaff) {
      router.replace('/staff/login')
      return
    }

    // Role-based default destination:
    switch (currentStaff.role) {
      case 'KITCHEN':
        router.replace('/staff/kds')
        break
      case 'CASHIER':
        router.replace('/staff/cashier')
        break
      case 'BRANCH_MANAGER':
        router.replace('/staff/manager')
        break
      case 'SUPER_ADMIN':
        router.replace('/staff/admin')
        break
      default:
        router.replace('/staff/cashier')
    }
  }, [currentStaff, mounted, router])

  if (!mounted || !currentStaff) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
        <p className="text-sm text-gray-400">Loading Staff Console…</p>
      </div>
    )
  }

  // Fallback hub display if redirect is delayed
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">Staff Operations Dashboard</h1>
        <p className="text-sm text-gray-400">
          Welcome back, {currentStaff.full_name} ({currentStaff.role.replace('_', ' ')})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {canAccessKds(currentStaff.role) && (
          <Link
            href="/staff/kds"
            className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-amber-500/50 hover:bg-gray-850 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                  Kitchen Display System (KDS)
                </h3>
                <p className="text-xs text-gray-400">Live order tickets & item bumping</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        )}

        {canAccessCashier(currentStaff.role) && (
          <Link
            href="/staff/cashier"
            className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 hover:bg-gray-850 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Cashier & Dispatch
                </h3>
                <p className="text-xs text-gray-400">Delivery quotes & POS payments</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        )}

        {canAccessManager(currentStaff.role) && (
          <Link
            href="/staff/manager"
            className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-850 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                  Manager & Z-Report
                </h3>
                <p className="text-xs text-gray-400">Daily reconciliation & close day</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        )}

        {canAccessAdmin(currentStaff.role) && (
          <Link
            href="/staff/admin"
            className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 hover:bg-gray-850 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                  Super Admin Console
                </h3>
                <p className="text-xs text-gray-400">Multi-branch analytics & global controls</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        )}
      </div>
    </div>
  )
}
