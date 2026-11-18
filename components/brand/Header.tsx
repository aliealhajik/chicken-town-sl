'use client'

import * as React from 'react'
import Link from 'next/link'
import { ShoppingBag, User, MapPin, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface HeaderProps {
  cartCount?: number
  fulfillmentText?: string
  fulfillmentType?: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
  onCartClick?: () => void
  onFulfillmentClick?: () => void
}

export function Header({
  cartCount = 0,
  fulfillmentText = 'Pickup • Big Lumley',
  fulfillmentType = 'PICKUP',
  onCartClick,
  onFulfillmentClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-charcoal text-white shadow-md">
      {/* Top Banner Tagline */}
      <div className="bg-brand-red px-4 py-1 text-center text-xs font-bold tracking-widest uppercase text-white flex items-center justify-center space-x-2">
        <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-pulse" />
        <span>SWIT U MOT SWIT U LYF</span>
        <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-pulse" />
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red font-black text-brand-gold text-xl shadow-lg border border-brand-gold/30 group-hover:scale-105 transition-transform">
            🍗
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-brand-gold transition-colors">
              CHICKEN TOWN <span className="text-brand-gold">SL</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold/80 -mt-1 hidden sm:block">
              Freetown&apos;s Favourite
            </span>
          </div>
        </Link>

        {/* Center / Fulfillment Status Pill */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onFulfillmentClick}
            className="group flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-all border border-white/10 hover:border-brand-gold/50 cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-brand-gold" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {fulfillmentText}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-white/50 group-hover:text-white transition-colors">
              (change)
            </span>
          </button>
        </div>

        {/* Actions: Account & Cart */}
        <div className="flex items-center gap-2">
          {/* Account Button */}
          <Link href="/staff/login">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-brand-gold hover:bg-white/10 rounded-full"
              title="Staff Portal / Account"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>

          {/* Cart Button with Count Badge */}
          <Button
            onClick={onCartClick}
            variant="secondary"
            className="relative flex items-center gap-2 rounded-full px-4 py-2 font-bold text-charcoal bg-brand-gold hover:bg-brand-gold/90 shadow-md"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <Badge
                variant="default"
                className="ml-1 h-5 min-w-[20px] px-1.5 text-[11px] font-extrabold bg-brand-red text-white border border-white/20"
              >
                {cartCount}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>
    </header>
  )
}
