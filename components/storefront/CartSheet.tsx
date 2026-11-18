'use client'

import React from 'react'
import { X, Minus, Plus, Trash2, Bike, ShoppingBag, Utensils, ShoppingCart, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { formatSLE } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface CartSheetProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartSheet({ open, isOpen, onClose, onCheckout }: CartSheetProps) {
  const isSheetOpen = open ?? isOpen ?? false

  const {
    items,
    fulfillmentType,
    branchName,
    tableNumber,
    updateQuantity,
    removeItem,
    getCartSubtotal,
    getItemCount,
  } = useCartStore()

  const subtotal = getCartSubtotal()
  const itemCount = getItemCount()

  const FulfillmentIcon =
    fulfillmentType === 'DELIVERY'
      ? Bike
      : fulfillmentType === 'PICKUP'
      ? ShoppingBag
      : Utensils

  const fulfillmentLabel =
    fulfillmentType === 'DELIVERY'
      ? `Delivery from ${branchName}`
      : fulfillmentType === 'PICKUP'
      ? `Pickup at ${branchName}`
      : tableNumber
      ? `Dine-In at ${branchName} — Table ${tableNumber}`
      : `Dine-In at ${branchName}`

  return (
    <>
      {/* Backdrop */}
      {isSheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          'w-full sm:max-w-md',
          isSheetOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-brand-red" />
            <h2 className="text-base font-extrabold text-charcoal">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-brand-red text-white rounded-full">
                  {itemCount}
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 text-charcoal transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fulfillment pill */}
        {itemCount > 0 && (
          <div className="px-5 py-2.5 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-xs font-semibold">
              <FulfillmentIcon className="w-3 h-3" />
              <span>{fulfillmentLabel}</span>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-2 space-y-3">
          {itemCount === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
              <span className="text-6xl" aria-hidden="true">🛒</span>
              <div>
                <p className="font-extrabold text-charcoal text-lg">Your cart is empty.</p>
                <p className="text-sm text-brand-gold font-bold mt-1 tracking-wide uppercase">
                  SWIT U MOT SWIT U LYF
                </p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  Add some delicious chicken to get started!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-brand-red mt-2 text-sm py-2.5 px-6"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map((cartItem) => (
              <div
                key={cartItem.id}
                className="flex gap-3 bg-muted/30 rounded-2xl p-3.5 border border-border/60"
              >
                {/* Item Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-bold text-charcoal text-sm leading-tight truncate">
                    {cartItem.name}
                    {cartItem.variantName && (
                      <span className="font-normal text-muted-foreground"> — {cartItem.variantName}</span>
                    )}
                  </p>

                  {/* Modifiers list */}
                  {cartItem.selectedModifiers.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {cartItem.selectedModifiers.map((mod, i) => (
                        <li key={`${mod.groupId}-${mod.optionId}-${i}`} className="flex items-center gap-1">
                          <span className="text-brand-gold">•</span>
                          <span>{mod.optionName}</span>
                          {mod.priceDelta > 0 && (
                            <span className="text-brand-red font-medium">+{formatSLE(mod.priceDelta)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatSLE(cartItem.unitPrice)} × {cartItem.quantity}
                    </span>
                    <span className="font-bold text-brand-red text-sm">
                      {formatSLE(cartItem.itemTotal)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= 20}
                    className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold text-charcoal tabular-nums w-5 text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
                    aria-label={cartItem.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                  >
                    {cartItem.quantity === 1 ? (
                      <Trash2 className="w-3 h-3 text-destructive" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary + Checkout */}
        {itemCount > 0 && (
          <div className="shrink-0 border-t border-border p-5 space-y-4 bg-background">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal font-semibold">Subtotal</span>
              <span className="text-sm font-extrabold text-charcoal tabular-nums">{formatSLE(subtotal)}</span>
            </div>

            {/* Delivery fee notice */}
            {fulfillmentType === 'DELIVERY' && (
              <p className="text-xs text-muted-foreground bg-muted/60 rounded-xl px-3.5 py-2.5 leading-relaxed">
                🛵 Delivery fee is calculated by the 392 dispatch team after you place your order.
              </p>
            )}

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={onCheckout}
              className="btn-brand-red w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSheet
