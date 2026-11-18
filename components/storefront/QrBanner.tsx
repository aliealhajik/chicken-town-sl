'use client'

import * as React from 'react'
import { QrCode, Lock, Utensils, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface QrBannerProps {
  branchName?: string
  tableNumber?: string | number
  onReset?: () => void
  className?: string
}

export function QrBanner({
  branchName = 'Big Lumley Branch',
  tableNumber,
  onReset,
  className = '',
}: QrBannerProps) {
  if (!tableNumber) return null

  return (
    <div
      className={`relative w-full border-y border-brand-gold/40 bg-gradient-to-r from-amber-500 via-brand-gold to-amber-500 text-charcoal px-4 py-3 shadow-md ${className}`}
      role="alert"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        {/* Left: Icon & High-contrast Table announcement */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-charcoal text-brand-gold shadow-md">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black uppercase tracking-tight text-base sm:text-lg text-charcoal">
                Ordering for {branchName} — Table {tableNumber}
              </span>
              <Badge
                variant="default"
                className="bg-charcoal text-brand-gold hover:bg-charcoal flex items-center gap-1 text-[11px] font-bold border-none"
              >
                <Lock className="h-3 w-3" />
                Table Locked
              </Badge>
            </div>
            <p className="text-xs text-charcoal/80 font-medium">
              Dine-In QR Order • Freshly prepared and delivered straight to your table
            </p>
          </div>
        </div>

        {/* Right: Info / Badge */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/10 px-3 py-1 font-semibold text-charcoal">
            <QrCode className="h-4 w-4" />
            <span>QR Table #{tableNumber}</span>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="text-xs text-charcoal/70 underline hover:text-charcoal font-semibold ml-2 cursor-pointer"
            >
              Exit Table Mode
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
