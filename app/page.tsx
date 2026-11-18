'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Truck,
  Store,
  Clock,
  MapPin,
  ArrowRight,
  Flame,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

interface BranchInfo {
  name: string
  slug: string
  isHub: boolean
  tag: string
  address: string
  hours: string
}

const BRANCHES: BranchInfo[] = [
  {
    name: '392 Main Hub',
    slug: '392',
    isHub: true,
    tag: 'Central Delivery & Dispatch Hub',
    address: '392 Main Motor Road, Freetown',
    hours: '10:00 AM – 02:00 AM',
  },
  {
    name: 'Little Lumley Branch',
    slug: 'little-lumley',
    isHub: false,
    tag: 'Takeaway & Dine-In',
    address: 'Little Lumley, Freetown',
    hours: '10:00 AM – 02:00 AM',
  },
  {
    name: 'Big Lumley Branch',
    slug: 'big-lumley',
    isHub: false,
    tag: 'Takeaway & Dine-In',
    address: 'Lumley Beach Road, Freetown',
    hours: '10:00 AM – 02:00 AM',
  },
  {
    name: 'Wilkinson Road Branch',
    slug: 'wilkinson-road',
    isHub: false,
    tag: 'Takeaway & Dine-In',
    address: 'Wilkinson Road, Freetown',
    hours: '10:00 AM – 02:00 AM',
  },
  {
    name: 'Old Railway Line Branch',
    slug: 'old-railway-line',
    isHub: false,
    tag: 'Takeaway & Dine-In',
    address: 'Old Railway Line, Tengbeh Town',
    hours: '10:00 AM – 02:00 AM',
  },
  {
    name: 'Wilberforce Street Branch',
    slug: 'wilberforce-street',
    isHub: false,
    tag: 'Takeaway & Dine-In',
    address: 'Wilberforce Street, Central Freetown',
    hours: '10:00 AM – 02:00 AM',
  },
  {
    name: 'Jui Branch',
    slug: 'jui',
    isHub: false,
    tag: 'Takeaway & Dine-In',
    address: 'Jui Junction, Freetown Highway',
    hours: '10:00 AM – 02:00 AM',
  },
]

export default function HomePage() {
  const [activeOrders, setActiveOrders] = useState<string[]>([])

  useEffect(() => {
    try {
      // Check localStorage for cart store active orders or fallback active order keys
      const stored = localStorage.getItem('chicken_town_active_orders')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setActiveOrders(parsed)
        }
      } else {
        // Also check zustand cart store if stored there
        const zustandStore = localStorage.getItem('chicken-town-cart')
        if (zustandStore) {
          const parsed = JSON.parse(zustandStore)
          if (parsed?.state?.activeOrderIds && Array.isArray(parsed.state.activeOrderIds)) {
            setActiveOrders(parsed.state.activeOrderIds)
          }
        }
      }
    } catch {
      // ignore parsing errors
    }
  }, [])

  return (
    <div className="min-h-screen bg-charcoal text-off-white flex flex-col selection:bg-brand-red selection:text-white">
      {/* Top Notification Banner */}
      <div className="bg-brand-red text-white text-xs md:text-sm font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-4 h-4 text-brand-gold animate-pulse shrink-0" />
        <span>Freetown&apos;s Hot &amp; Fresh Fried Chicken • Open Daily 10:00 AM – 02:00 AM</span>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-charcoal/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-red to-red-700 flex items-center justify-center shadow-lg shadow-brand-red/30 group-hover:scale-105 transition-transform">
              <Flame className="w-7 h-7 text-brand-gold" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                CHICKEN TOWN <span className="text-brand-gold text-lg">SL</span>
              </div>
              <div className="text-[10px] sm:text-xs text-brand-gold font-bold uppercase tracking-widest">
                SWIT U MOT SWIT U LYF
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {activeOrders.length > 0 && (
              <Link
                href={`/orders/${activeOrders[activeOrders.length - 1]}`}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/25 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Track Active Order ({activeOrders.length})</span>
              </Link>
            )}

            <Link
              href="/order"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 transition-all text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Now</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/10">
        <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-bold uppercase tracking-wider mb-6">
              <Flame className="w-4 h-4 text-brand-red shrink-0" />
              Freetown&apos;s #1 Crispy Fried Chicken
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-6">
              SWIT U MOT,<br />
              <span className="text-brand-gold drop-shadow-sm">SWIT U LYF!</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
              Golden crispy chicken, savoury seasoned wings, signature Jollof and fried rice, loaded burgers, and cold drinks.
              Fast delivery direct from our central <strong className="text-white">392 Hub</strong> or quick pickup at 7 locations across Freetown.
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/order?type=delivery"
                className="inline-flex items-center justify-center gap-3 bg-brand-red hover:bg-red-700 text-white font-bold px-6 py-4 rounded-xl text-base shadow-xl shadow-brand-red/30 hover:scale-[1.02] transition-all"
              >
                <Truck className="w-5 h-5 text-brand-gold" />
                <span>Order Delivery (Fast from 392)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/order?type=pickup"
                className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-4 rounded-xl text-base border border-white/15 hover:border-white/30 hover:scale-[1.02] transition-all"
              >
                <Store className="w-5 h-5 text-brand-gold" />
                <span>Order Pickup / Dine-In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Active Orders Quick Notice if exists */}
            {activeOrders.length > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-brand-gold/30 flex items-center justify-between gap-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-brand-gold animate-ping" />
                  <div>
                    <div className="text-xs text-brand-gold font-bold uppercase tracking-wider">Active Order in Progress</div>
                    <div className="text-sm font-semibold text-white">You have {activeOrders.length} order being processed</div>
                  </div>
                </div>
                <Link
                  href={`/orders/${activeOrders[activeOrders.length - 1]}`}
                  className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1 shrink-0"
                >
                  Track Live <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-red/20 text-brand-red flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-brand-gold" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Dedicated Central Hub</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                All delivery orders originate exclusively from our state-of-the-art <strong>392 Hub</strong>, guaranteeing consistent quality and blazing fast dispatch.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-red/20 text-brand-red flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-brand-gold" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">7 Freetown Branches</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                From Lumley and Wilkinson Road to Wilberforce Street and Jui, hot crispy chicken is always right around your corner.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-red/20 text-brand-red flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-brand-gold" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Transparent Local Payments</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Pay seamlessly in Sierra Leone Leones (SLE / Le) via Monime (Orange Money, Afrimoney, Card) or choose Pay on Arrival at your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Branch Locator Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-red" />
                Our Locations
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Visit or Order from 7 Official Branches
              </h2>
            </div>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:underline self-start md:self-auto"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BRANCHES.map((branch) => (
              <div
                key={branch.slug}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  branch.isHub
                    ? 'bg-gradient-to-b from-brand-red/20 to-white/5 border-brand-red/50 shadow-lg shadow-brand-red/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{branch.name}</h3>
                    {branch.isHub ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-brand-red text-white shadow-sm">
                        Delivery Hub
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/10 text-white/80">
                        Retail Branch
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-brand-gold font-medium mb-3">{branch.tag}</p>

                  <div className="space-y-2 text-xs text-white/70 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span>{branch.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={`/order?branch=${branch.slug}&type=${branch.isHub ? 'delivery' : 'pickup'}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-brand-gold transition-colors"
                  >
                    <span>Order Here</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Open Now
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-black/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-white/60 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-white text-base">CHICKEN TOWN SL</span>
            <span className="text-brand-gold font-extrabold">•</span>
            <span className="text-brand-gold font-semibold uppercase tracking-wider">SWIT U MOT SWIT U LYF</span>
          </div>
          <p>
            Operating Daily: 10:00 AM – 02:00 AM across all branches in Freetown, Sierra Leone.
          </p>
          <p className="text-white/40">
            &copy; {new Date().getFullYear()} Chicken Town SL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
