'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatSLE } from '@/lib/utils'
import type { MenuItem } from '@/lib/data/menu-data'
import { isItemAvailableAtBranch } from '@/lib/data/menu-data'
import { useCartStore } from '@/store/useCartStore'
import { PackageX } from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
  onSelectItem: (item: MenuItem) => void
  currentBranchId?: string
}

export function MenuItemCard({ item, onSelectItem, currentBranchId }: MenuItemCardProps) {
  const { fulfillmentType, branchId, branchName } = useCartStore()

  // Determine effective branch for availability check
  const effectiveBranchId = currentBranchId ?? branchId

  // If DELIVERY, strictly check 392 (delivery hub)
  const isAvailable = useMemo(() => {
    return isItemAvailableAtBranch(item.id, effectiveBranchId)
  }, [item.id, effectiveBranchId])

  // Calculate display price
  const displayPrice = useMemo(() => {
    if (item.base_price !== null && item.base_price !== undefined) {
      return { label: formatSLE(item.base_price), hasFrom: false }
    }
    if (item.variants && item.variants.length > 0) {
      const prices = item.variants.filter((v) => v.is_active).map((v) => v.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      if (min === max) return { label: formatSLE(min), hasFrom: false }
      return { label: formatSLE(min), hasFrom: true }
    }
    return { label: 'Price on request', hasFrom: false }
  }, [item])

  const handleClick = () => {
    if (!isAvailable) return
    onSelectItem(item)
  }

  return (
    <div
      role={isAvailable ? 'button' : 'presentation'}
      tabIndex={isAvailable ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'menu-card flex flex-col group relative',
        isAvailable
          ? 'cursor-pointer'
          : 'cursor-not-allowed opacity-60 grayscale'
      )}
      aria-label={
        isAvailable
          ? `Add ${item.name} to cart`
          : `${item.name} — unavailable at ${branchName}`
      }
    >
      {/* Item Image */}
      <div className="relative w-full h-40 bg-muted/50 overflow-hidden shrink-0">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.removeAttribute('style')
            }}
          />
        ) : null}
        {/* Placeholder / fallback */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-red/10 to-brand-gold/10"
          style={{ display: item.image_url ? 'none' : 'flex' }}
          aria-hidden="true"
        >
          <span className="text-4xl select-none">🍗</span>
        </div>

        {/* Out of stock badge overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 gap-1.5">
            <PackageX className="w-7 h-7 text-white/90" />
            <span className="text-[11px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full text-center leading-tight max-w-[90%]">
              Out of Stock at {branchName}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-3.5 gap-1.5">
        <h3 className="font-bold text-charcoal text-sm leading-tight line-clamp-2 flex-1">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="menu-card-price text-sm">
            {displayPrice.hasFrom && (
              <span className="text-xs font-semibold text-muted-foreground mr-1">From</span>
            )}
            {displayPrice.label}
          </p>

          {isAvailable && (
            <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-150">
              <span className="text-white text-lg leading-none mb-0.5" aria-hidden="true">+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface MenuGridProps {
  items: MenuItem[]
  onSelectItem: (item: MenuItem) => void
  currentBranchId?: string
  className?: string
}

export function MenuGrid({ items, onSelectItem, currentBranchId, className }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
        <span className="text-5xl" aria-hidden="true">🍗</span>
        <div>
          <p className="font-bold text-charcoal text-lg">No items found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try searching for something else, or browse our full menu.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4',
        className
      )}
    >
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onSelectItem={onSelectItem}
          currentBranchId={currentBranchId}
        />
      ))}
    </div>
  )
}
