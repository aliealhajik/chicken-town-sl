'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Flame,
  UtensilsCrossed,
  Receipt,
  BarChart3,
  ShieldAlert,
  LogOut,
  Calendar,
  Volume2,
  ChevronDown,
  Building2,
  UserCheck,
} from 'lucide-react'
import {
  useStaffStore,
  DEMO_PRESETS,
  canAccessKds,
  canAccessCashier,
  canAccessManager,
  canAccessAdmin,
  getRoleBadgeConfig,
} from '@/lib/staff-auth'
import { playOrderChime } from '@/lib/audio-chime'
import { Button } from '@/components/ui/button'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentStaff, activeAccountingDate, loginAsDemo, logout } = useStaffStore()
  const [showSwitchMenu, setShowSwitchMenu] = React.useState(false)

  // In /staff/login page, don't show the staff portal navigation shell
  const isLoginPage = pathname === '/staff/login'

  const roleConfig = getRoleBadgeConfig(currentStaff?.role)

  const navLinks = [
    {
      href: '/staff/kds',
      label: 'Kitchen KDS',
      icon: UtensilsCrossed,
      show: canAccessKds(currentStaff?.role),
    },
    {
      href: '/staff/cashier',
      label: 'Cashier & Dispatch',
      icon: Receipt,
      show: canAccessCashier(currentStaff?.role),
    },
    {
      href: '/staff/manager',
      label: 'Manager & Z-Report',
      icon: BarChart3,
      show: canAccessManager(currentStaff?.role),
    },
    {
      href: '/staff/admin',
      label: 'Super Admin',
      icon: ShieldAlert,
      show: canAccessAdmin(currentStaff?.role),
    },
  ]

  if (isLoginPage) {
    return <div className="min-h-screen bg-charcoal text-white">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 flex flex-col font-sans">
      {/* Top Staff App Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#181818]/95 backdrop-blur shadow-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Brand & Portal Badge */}
          <div className="flex items-center gap-4">
            <Link href="/staff" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red font-black text-brand-gold text-lg shadow-md border border-brand-gold/30">
                🍗
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-brand-gold transition-colors">
                  CHICKEN TOWN <span className="text-brand-gold">SL</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold/90 -mt-0.5">
                  Staff Operations
                </span>
              </div>
            </Link>

            {/* Navigation tabs for tablet/desktop */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-800">
              {navLinks
                .filter((item) => item.show)
                .map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-red text-white shadow-sm'
                          : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
            </nav>
          </div>

          {/* Right: Operational Status & Staff Controls */}
          <div className="flex items-center gap-3">
            {/* Audio Chime Test */}
            <button
              onClick={() => playOrderChime()}
              className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-brand-gold transition-colors text-xs flex items-center gap-1 border border-gray-700/60"
              title="Test Kitchen / Order Chime"
              type="button"
            >
              <Volume2 className="h-4 w-4" />
              <span className="hidden lg:inline">Chime</span>
            </button>

            {/* Accounting Day Date Pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gray-800/80 px-2.5 py-1 text-xs border border-gray-700/60 text-gray-300">
              <Calendar className="h-3.5 w-3.5 text-brand-gold" />
              <span>Day:</span>
              <span className="font-mono font-bold text-white">
                {activeAccountingDate}
              </span>
            </div>

            {/* Branch Pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gray-800/80 px-2.5 py-1 text-xs border border-gray-700/60 text-gray-300">
              <Building2 className="h-3.5 w-3.5 text-brand-gold" />
              <span className="font-medium text-white max-w-[130px] truncate">
                {currentStaff?.branch_name || 'All Branches (HQ)'}
              </span>
            </div>

            {/* Role Badge */}
            <div
              className={`rounded-lg px-2.5 py-1 text-xs border ${roleConfig.bgClass} ${roleConfig.borderClass} ${roleConfig.textClass}`}
            >
              {roleConfig.label}
            </div>

            {/* Switch User / Logout Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-750 px-2.5 py-1.5 text-xs font-semibold text-white border border-gray-700 transition-colors"
              >
                <span className="max-w-[90px] truncate">
                  {currentStaff?.full_name?.split(' ')[0] || 'Staff'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              {showSwitchMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowSwitchMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-xs font-semibold text-white">
                      {currentStaff?.full_name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {currentStaff?.email}
                    </p>
                  </div>

                  <div className="py-2">
                    <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Switch Role (Demo Profiles)
                    </p>
                    {DEMO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          loginAsDemo(preset.id)
                          router.refresh()
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex flex-col hover:bg-gray-800 transition-colors ${
                          currentStaff?.role === preset.role &&
                          currentStaff?.branch_id === preset.branch_id
                            ? 'bg-gray-800/90 text-brand-gold font-bold'
                            : 'text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{preset.full_name}</span>
                          <span className="text-[10px] text-gray-400">
                            {preset.branch_name.split(' ')[0]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-800">
                    <Link
                      href="/staff/login"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Switch Account / Login</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout()
                        router.push('/staff/login')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto border-t border-gray-800 bg-[#141414] px-4 py-2 gap-2 scrollbar-none">
          {navLinks
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    isActive
                      ? 'bg-brand-red text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
