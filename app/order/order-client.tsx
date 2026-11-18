'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Clock,
  Sparkles,
  ShoppingBag,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react'

// Store imports
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'

// Data imports
import { getBranches, getBranchBySlug, getDeliveryHub } from '@/lib/data/branches'
import { getCategories, getMenuItems, type MenuItem, type Category } from '@/lib/data/menu-data'

// Component imports
import { Header } from '@/components/brand/Header'
import { QrBanner } from '@/components/storefront/QrBanner'
import { FulfillmentSelector } from '@/components/storefront/FulfillmentSelector'
import { CategoryTabs } from '@/components/storefront/CategoryTabs'
import { SearchBar } from '@/components/storefront/SearchBar'
import { MenuGrid } from '@/components/storefront/MenuGrid'
import { ItemCustomizerModal } from '@/components/storefront/ItemCustomizerModal'
import { CartSheet } from '@/components/storefront/CartSheet'
import CheckoutModal from '@/components/storefront/CheckoutModal'
import CustomerAccountModal from '@/components/storefront/CustomerAccountModal'
import OrderStatusCard from '@/components/storefront/OrderStatusCard'

export default function OrderClient() {
  const searchParams = useSearchParams()

  // Store actions and state
  const {
    fulfillmentType,
    branchId,
    branchSlug,
    branchName,
    tableNumber,
    isQrLocked,
    activeOrderIds,
    setFulfillment,
    setQrLock,
    getItemCount,
    getCartSubtotal,
  } = useCartStore()

  const { user } = useAuthStore()

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [selectedItemForCustomize, setSelectedItemForCustomize] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState('all')
  const [showActiveOrderCard, setShowActiveOrderCard] = useState(false)

  // Ref to scroll to fulfillment selector
  const fulfillmentSectionRef = useRef<HTMLDivElement>(null)

  // 1. Detect QR Table & Fulfillment Query Params
  useEffect(() => {
    const branchParam = searchParams.get('branch')
    const tableParam = searchParams.get('table')
    const typeParam = searchParams.get('type')

    // QR Table Detection: /order?branch=<slug>&table=<number>
    if (branchParam && tableParam) {
      const branch = getBranchBySlug(branchParam)
      if (branch) {
        setQrLock(
          true,
          {
            id: branch.id,
            slug: branch.slug,
            name: branch.name,
          },
          tableParam
        )
      } else {
        // Fallback with slug as name if not in standard list
        setQrLock(
          true,
          {
            id: branchParam,
            slug: branchParam,
            name: branchParam
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
          },
          tableParam
        )
      }
    } else if (typeParam && !isQrLocked) {
      // General fulfillment quick-action: /order?type=delivery or /order?type=pickup
      const lowerType = typeParam.toLowerCase()
      if (lowerType === 'delivery') {
        const hub = getDeliveryHub()
        setFulfillment({
          fulfillmentType: 'DELIVERY',
          branchId: hub.id,
          branchSlug: hub.slug,
          branchName: hub.name,
          tableNumber: null,
          orderSource: 'WEB',
        })
      } else if (lowerType === 'pickup') {
        if (branchParam) {
          const branch = getBranchBySlug(branchParam)
          if (branch) {
            setFulfillment({
              fulfillmentType: 'PICKUP',
              branchId: branch.id,
              branchSlug: branch.slug,
              branchName: branch.name,
              tableNumber: null,
              orderSource: 'WEB',
            })
          }
        } else {
          setFulfillment({
            fulfillmentType: 'PICKUP',
            tableNumber: null,
            orderSource: 'WEB',
          })
        }
      }
    }
  }, [searchParams, setQrLock, setFulfillment, isQrLocked])

  // Data
  const allCategories = useMemo(() => getCategories(), [])
  const allMenuItems = useMemo(() => getMenuItems(), [])

  // Filter menu items by active category & search query
  const filteredItems = useMemo(() => {
    let items = allMenuItems

    // Filter by Category
    if (activeCategoryId !== 'all') {
      items = items.filter((item) => item.categoryId === activeCategoryId)
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim()
      items = items.filter((item) => {
        const matchName = item.name.toLowerCase().includes(q)
        const matchDesc = item.description?.toLowerCase().includes(q)
        const matchCategory = item.categoryId.toLowerCase().includes(q)
        return matchName || matchDesc || matchCategory
      })
    }

    return items
  }, [allMenuItems, activeCategoryId, searchQuery])

  // Format fulfillment text for Header status pill
  const headerFulfillmentText = useMemo(() => {
    if (isQrLocked && tableNumber) {
      return `Dine-In • Table ${tableNumber} (${branchName})`
    }
    if (fulfillmentType === 'DELIVERY') {
      return `Delivery • Fast from ${branchName || '392 Hub'}`
    }
    if (fulfillmentType === 'PICKUP') {
      return `Pickup • ${branchName || 'Select Branch'}`
    }
    return `Dine-In • ${branchName || 'Select Branch'}`
  }, [fulfillmentType, branchName, tableNumber, isQrLocked])

  const cartCount = getItemCount()
  const latestActiveOrderId = activeOrderIds.length > 0 ? activeOrderIds[0] : null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-brand-red selection:text-white">
      {/* ── Brand Header ─────────────────────────────────────────── */}
      <Header
        cartCount={cartCount}
        fulfillmentText={headerFulfillmentText}
        fulfillmentType={fulfillmentType}
        onCartClick={() => setIsCartOpen(true)}
        onFulfillmentClick={() => {
          fulfillmentSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* ── QR Dine-In Table Banner ──────────────────────────────── */}
      {isQrLocked && tableNumber && (
        <QrBanner
          branchName={branchName}
          tableNumber={tableNumber}
          onReset={() => {
            if (confirm('Exit Table Order mode and return to standard ordering?')) {
              setQrLock(false)
            }
          }}
        />
      )}

      {/* ── Customer Account & Active Order Status Bar ────────────── */}
      <div className="bg-white border-b border-slate-200 py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Left: User sign-in status or greeting */}
          <button
            onClick={() => setIsAccountOpen(true)}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-brand-red transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-brand-red" />
            <span>
              {user ? (
                <>Welcome back, <strong className="text-slate-900">{user.name}</strong></>
              ) : (
                <>Sign In / Register for 1-Click Reordering</>
              )}
            </span>
          </button>

          {/* Right: Active Order Tracker Link */}
          {latestActiveOrderId && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActiveOrderCard((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-brand-red" />
                <span>Track Active Order</span>
                {showActiveOrderCard ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Active Order Inline Status Card (if toggled) ─────────── */}
      {latestActiveOrderId && showActiveOrderCard && (
        <div className="max-w-3xl mx-auto w-full px-4 pt-6">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-300 p-4 relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-800">Live Order Progression</h3>
              </div>
              <button
                onClick={() => setShowActiveOrderCard(false)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <OrderStatusCard orderId={latestActiveOrderId} />
          </div>
        </div>
      )}

      {/* ── Main Order Interface ──────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Fulfillment Selector Section */}
        <section ref={fulfillmentSectionRef} className="scroll-mt-24">
          <FulfillmentSelector />
        </section>

        {/* Search Bar */}
        <section>
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onClear={() => setSearchQuery('')}
            placeholder="Search fried chicken, wings, jollof rice, family deals, drinks…"
          />
        </section>

        {/* Category Tabs */}
        <section className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8">
          <CategoryTabs
            categories={allCategories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={(catId) => setActiveCategoryId(catId)}
          />
        </section>

        {/* Menu Items Count & Active Category Headline */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeCategoryId === 'all'
                ? 'Full Menu'
                : allCategories.find((c) => c.id === activeCategoryId)?.name || 'Menu Items'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Showing {filteredItems.length} delicious {filteredItems.length === 1 ? 'item' : 'items'}
              {fulfillmentType === 'DELIVERY' ? ' (Delivery dispatched from 392 Hub)' : ` (${branchName})`}
            </p>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-brand-red font-bold hover:underline"
            >
              Clear Search ({searchQuery})
            </button>
          )}
        </div>

        {/* Menu Grid */}
        <section className="pb-24">
          <MenuGrid
            items={filteredItems}
            onSelectItem={(item) => setSelectedItemForCustomize(item)}
            currentBranchId={branchId}
          />
        </section>
      </main>

      {/* ── Floating Mobile Cart Bar ─────────────────────────────── */}
      {cartCount > 0 && (
        <aside
          aria-label="Cart Bar"
          className="fixed bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none sm:hidden"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="pointer-events-auto w-full bg-brand-red hover:bg-red-700 text-white font-extrabold py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 transform active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-brand-gold text-charcoal font-black text-xs flex items-center justify-center">
                {cartCount}
              </span>
              <span className="text-sm">View Cart</span>
            </div>
            <span className="text-sm font-black text-brand-gold">
              Le {getCartSubtotal().toLocaleString('en-SL')}
            </span>
          </button>
        </aside>
      )}

      {/* ── Modals & Sheets ──────────────────────────────────────── */}
      {/* 1. Item Customizer Modal */}
      <ItemCustomizerModal
        item={selectedItemForCustomize}
        onClose={() => setSelectedItemForCustomize(null)}
      />

      {/* 2. Cart Drawer / Slide-Over */}
      <CartSheet
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* 4. Customer Account Modal */}
      <CustomerAccountModal
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </div>
  )
}
