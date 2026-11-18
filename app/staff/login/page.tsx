'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldAlert,
  ChefHat,
  Receipt,
  BarChart3,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  KeyRound,
} from 'lucide-react'
import { useStaffStore, DEMO_PRESETS } from '@/store/useStaffStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function StaffLoginPage() {
  const router = useRouter()
  const { loginAsDemo, loginWithSupabase, isLoading, error } = useStaffStore()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [authError, setAuthError] = React.useState<string | null>(null)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    if (!email || !password) {
      setAuthError('Please enter both email and password.')
      return
    }

    const res = await loginWithSupabase(email, password)
    if (res.success) {
      router.push('/staff')
    } else {
      setAuthError(res.error || 'Invalid credentials')
    }
  }

  const handleDemoLogin = (presetId: string) => {
    loginAsDemo(presetId)
    router.push('/staff')
  }

  const getPresetIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <ShieldAlert className="h-5 w-5 text-purple-400" />
      case 'BRANCH_MANAGER':
        return <BarChart3 className="h-5 w-5 text-blue-400" />
      case 'CASHIER':
        return <Receipt className="h-5 w-5 text-emerald-400" />
      case 'KITCHEN':
        return <ChefHat className="h-5 w-5 text-amber-400" />
      default:
        return <KeyRound className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red font-black text-brand-gold text-2xl shadow-xl border border-brand-gold/30 group-hover:scale-105 transition-transform">
              🍗
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-white group-hover:text-brand-gold transition-colors">
                CHICKEN TOWN <span className="text-brand-gold">SL</span>
              </h1>
              <p className="text-[11px] uppercase font-bold tracking-widest text-brand-gold">
                SWIT U MOT SWIT U LYF
              </p>
            </div>
          </Link>
          <div className="pt-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Staff & Operations Portal
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Select a quick demo profile or sign in with your Chicken Town SL staff credentials.
            </p>
          </div>
        </div>

        {/* Quick Demo Login Preset Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Demo Access (One-Click Testing)</span>
            </div>
            <span className="text-[11px] text-gray-500">No password required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleDemoLogin(preset.id)}
                className="group relative flex flex-col justify-between p-4 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-brand-gold/60 hover:bg-gray-850 shadow-lg text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gray-800 border border-gray-700/60 group-hover:bg-brand-red/20 group-hover:border-brand-red/50 transition-colors">
                      {getPresetIcon(preset.role)}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-wider border-gray-700 text-gray-300"
                    >
                      {preset.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-brand-gold transition-colors">
                    {preset.full_name}
                  </h3>
                  <p className="text-xs text-brand-gold/90 font-medium mt-0.5">
                    {preset.branch_name}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-semibold text-gray-300 group-hover:text-white">
                  <span>Enter as {preset.role.split('_')[0]}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-gold group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Or Sign In With Staff Email
          </span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        {/* Email / Password Form */}
        <div className="max-w-md mx-auto w-full bg-gray-900/80 rounded-2xl border border-gray-800 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {(authError || error) && (
              <div className="rounded-lg bg-red-950/50 border border-red-800/80 p-3 text-xs text-red-200">
                {authError || error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300"
              >
                Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@chickentownsl.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-brand-red"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-brand-red"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-bold h-11 rounded-xl shadow-lg mt-2"
            >
              {isLoading ? 'Signing In…' : 'Sign In to Staff Console'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <Link href="/" className="hover:text-brand-gold underline transition-colors">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
