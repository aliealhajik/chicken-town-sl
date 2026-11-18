'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  ChefHat,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Utensils,
  Bike,
  ShoppingBag,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Building2,
  RefreshCw,
  Sparkles,
  QrCode,
  Flame,
} from 'lucide-react'
import { useStaffStore } from '@/store/useStaffStore'
import { BRANCHES } from '@/lib/data/branches'
import { playOrderChime, playUrgentChime } from '@/lib/audio-chime'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export interface KdsOrderItem {
  id: string
  item_name: string
  variant_name?: string | null
  quantity: number
  modifiers_snapshot?: unknown
}

export interface KdsOrder {
  id: string
  order_number: string
  order_source: 'WEB' | 'QR_TABLE' | 'WHATSAPP'
  fulfillment_type: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
  branch_id: string
  table_number: string | null
  customer_name: string
  customer_phone: string
  order_notes: string | null
  status: 'CONFIRMED' | 'PREPARING' | 'READY' | string
  created_at: string
  items: KdsOrderItem[]
}

// Fallback seed orders if DB is not populated or offline
const MOCK_KDS_ORDERS: KdsOrder[] = [
  {
    id: 'mock-kds-1',
    order_number: 'CT-20241117-0012',
    order_source: 'QR_TABLE',
    fulfillment_type: 'DINE_IN',
    branch_id: 'b1000000-0000-0000-0000-000000000001', // Little Lumley
    table_number: '20',
    customer_name: 'Alpha Barrie',
    customer_phone: '+232 78 555 123',
    order_notes: 'Extra spicy pepper sauce please! Very hot!',
    status: 'CONFIRMED',
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4m ago
    items: [
      {
        id: 'item-1',
        item_name: 'BBQ Wings',
        variant_name: '4 Wings',
        quantity: 2,
        modifiers_snapshot: [
          { groupName: 'Choose a Sauce', optionName: 'Hot Pepper' },
        ],
      },
      {
        id: 'item-2',
        item_name: 'Jollof Rice + Shredded Chicken',
        variant_name: null,
        quantity: 1,
        modifiers_snapshot: [],
      },
      {
        id: 'item-3',
        item_name: 'Vimto',
        variant_name: 'Can',
        quantity: 2,
        modifiers_snapshot: [],
      },
    ],
  },
  {
    id: 'mock-kds-2',
    order_number: 'CT-20241117-0009',
    order_source: 'WEB',
    fulfillment_type: 'DELIVERY',
    branch_id: 'b1000000-0000-0000-0000-000000000007', // 392 Hub
    table_number: null,
    customer_name: 'Zainab Mansaray',
    customer_phone: '+232 77 982 441',
    order_notes: 'Pack cutlery and plenty of serviettes.',
    status: 'PREPARING',
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14m ago
    items: [
      {
        id: 'item-4',
        item_name: 'Family Deal',
        variant_name: null,
        quantity: 1,
        modifiers_snapshot: [
          { groupName: 'Choose 2 Sides', optionName: 'Plain Jollof Rice' },
          { groupName: 'Choose 2 Sides', optionName: 'Fried Rice' },
          { groupName: 'Choose 4 Soft Drinks', optionName: 'Coke (4x)' },
        ],
      },
      {
        id: 'item-5',
        item_name: 'Plantain',
        variant_name: null,
        quantity: 2,
        modifiers_snapshot: [],
      },
    ],
  },
  {
    id: 'mock-kds-3',
    order_number: 'CT-20241117-0007',
    order_source: 'WHATSAPP',
    fulfillment_type: 'PICKUP',
    branch_id: 'b1000000-0000-0000-0000-000000000001', // Little Lumley
    table_number: null,
    customer_name: 'Kelfala Koroma',
    customer_phone: '+232 76 331 990',
    order_notes: null,
    status: 'CONFIRMED',
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22m ago (Urgent)
    items: [
      {
        id: 'item-6',
        item_name: 'English Fowl',
        variant_name: 'Whole Chicken',
        quantity: 1,
        modifiers_snapshot: [],
      },
      {
        id: 'item-7',
        item_name: 'Crispy Chips',
        variant_name: null,
        quantity: 2,
        modifiers_snapshot: [
          { groupName: 'Choose a Sauce', optionName: 'Ketchup' },
        ],
      },
    ],
  },
  {
    id: 'mock-kds-4',
    order_number: 'CT-20241117-0005',
    order_source: 'QR_TABLE',
    fulfillment_type: 'DINE_IN',
    branch_id: 'b1000000-0000-0000-0000-000000000002', // Big Lumley
    table_number: '7',
    customer_name: 'Mariama Bangura',
    customer_phone: '+232 79 123 456',
    order_notes: null,
    status: 'READY',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-8',
        item_name: 'Snack Box',
        variant_name: null,
        quantity: 1,
        modifiers_snapshot: [
          { groupName: 'Choose a Side', optionName: 'Crispy Chips' },
          { groupName: 'Choose a Soft Drink', optionName: 'Sprite' },
        ],
      },
    ],
  },
]

export function KdsClient() {
  const { currentStaff, activeAccountingDate } = useStaffStore()

  // Selected Branch state (defaults to staff branch or first branch)
  const defaultBranchId =
    currentStaff?.branch_id ||
    BRANCHES.find((b) => b.slug === 'little-lumley')?.id ||
    BRANCHES[0].id

  const [activeBranchId, setActiveBranchId] = useState<string>(defaultBranchId)
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'READY'>('ACTIVE')
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [orders, setOrders] = useState<KdsOrder[]>(MOCK_KDS_ORDERS)
  const [flashBanner, setFlashBanner] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Sync active branch if staff updates
  useEffect(() => {
    if (currentStaff?.branch_id && currentStaff.role !== 'SUPER_ADMIN') {
      setActiveBranchId(currentStaff.branch_id)
    }
  }, [currentStaff])

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Active branch details
  const currentBranch = useMemo(() => {
    return (
      BRANCHES.find((b) => b.id === activeBranchId) ||
      BRANCHES.find((b) => b.slug === activeBranchId) ||
      BRANCHES[0]
    )
  }, [activeBranchId])

  // Fetch orders from Supabase with graceful fallback
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: dbOrders, error: orderErr } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_source,
          fulfillment_type,
          branch_id,
          table_number,
          customer_name,
          customer_phone,
          order_notes,
          status,
          created_at,
          order_items (
            id,
            item_name,
            variant_name,
            quantity,
            modifiers_snapshot
          )
        `)
        .eq('branch_id', activeBranchId)
        .in('status', ['CONFIRMED', 'PREPARING', 'READY'])
        .order('created_at', { ascending: true })

      if (!orderErr && dbOrders && dbOrders.length > 0) {
        const mapped: KdsOrder[] = dbOrders.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          order_source: o.order_source as KdsOrder['order_source'],
          fulfillment_type: o.fulfillment_type as KdsOrder['fulfillment_type'],
          branch_id: o.branch_id,
          table_number: o.table_number,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          order_notes: o.order_notes,
          status: o.status,
          created_at: o.created_at,
          items: (o.order_items || []).map((it) => ({
            id: it.id,
            item_name: it.item_name,
            variant_name: it.variant_name,
            quantity: it.quantity,
            modifiers_snapshot: it.modifiers_snapshot,
          })),
        }))
        setOrders(mapped)
      } else {
        // Filter mock orders for branch or show branch mocked data
        const branchMocks = MOCK_KDS_ORDERS.filter(
          (m) => m.branch_id === activeBranchId
        )
        // If no mock for this specific branch, show all mocks assigned to this branch for demonstration
        if (branchMocks.length > 0) {
          setOrders(branchMocks)
        } else {
          setOrders(
            MOCK_KDS_ORDERS.map((m) => ({ ...m, branch_id: activeBranchId }))
          )
        }
      }
    } catch {
      // Offline fallback
      setOrders(
        MOCK_KDS_ORDERS.map((m) => ({ ...m, branch_id: activeBranchId }))
      )
    } finally {
      setIsLoading(false)
    }
  }, [activeBranchId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Real-time Supabase subscription on orders table
  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null

    try {
      const supabase = createClient()
      channel = supabase
        .channel(`kds-orders-${activeBranchId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `branch_id=eq.${activeBranchId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newOrder = payload.new as {
                id: string
                order_number: string
                status: string
              }
              if (newOrder.status === 'CONFIRMED') {
                if (soundEnabled) playOrderChime({ volume: 0.6 })
                setFlashBanner(`🔔 NEW ORDER: ${newOrder.order_number}!`)
                setTimeout(() => setFlashBanner(null), 5000)
              }
              fetchOrders()
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as {
                id: string
                order_number: string
                status: string
              }
              if (updated.status === 'CONFIRMED') {
                if (soundEnabled) playOrderChime({ volume: 0.6 })
                setFlashBanner(`🔔 NEW ORDER: ${updated.order_number}!`)
                setTimeout(() => setFlashBanner(null), 5000)
              }
              fetchOrders()
            } else if (payload.eventType === 'DELETE') {
              fetchOrders()
            }
          }
        )
        .subscribe()
    } catch (e) {
      console.warn('Realtime subscription skipped:', e)
    }

    return () => {
      if (channel) {
        const supabase = createClient()
        supabase.removeChannel(channel)
      }
    }
  }, [activeBranchId, soundEnabled, fetchOrders])

  // Status advancement handlers
  const handleAdvanceStatus = async (
    orderId: string,
    nextStatus: 'PREPARING' | 'READY'
  ) => {
    // 1. Optimistic local update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    )

    if (soundEnabled && nextStatus === 'READY') {
      playOrderChime({ volume: 0.45, tone1Freq: 659.25, tone2Freq: 987.77 })
    }

    // 2. Persist to Supabase
    try {
      const supabase = createClient()
      await supabase
        .from('orders')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
    } catch (err) {
      console.warn('Status update sync:', err)
    }
  }

  // Filter orders by active tab
  const activeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'CONFIRMED' || o.status === 'PREPARING'
    )
  }, [orders])

  const readyOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'READY')
  }, [orders])

  const displayedOrders = activeTab === 'ACTIVE' ? activeOrders : readyOrders

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col font-sans select-none">
      {/* Top Bar Header */}
      <header className="bg-[#1a1a1a] border-b border-white/10 px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand + Branch Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-brand-gold text-xl font-black shadow-md">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white uppercase">
                  Kitchen Display System
                </h1>
                <span className="bg-brand-red text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  LIVE KDS
                </span>
              </div>
              <p className="text-xs text-white/60 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-gold" />
                <span>{currentBranch.name}</span>
                <span>•</span>
                <span>Accounting Date: {activeAccountingDate}</span>
              </p>
            </div>
          </div>

          {/* Center: Branch Switcher (for Super Admin or multi-branch testing) */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-white/60 hidden sm:inline">
              Branch:
            </label>
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="bg-black/40 border border-white/20 text-white font-semibold rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-brand-gold focus:outline-none cursor-pointer"
            >
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id} className="bg-charcoal text-white">
                  {b.name} {b.is_delivery_hub ? '(Hub)' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={fetchOrders}
              disabled={isLoading}
              title="Refresh tickets"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={cn('w-4 h-4', isLoading && 'animate-spin text-brand-gold')}
              />
            </button>
          </div>

          {/* Right: Audio Chime Controls + Live Clock */}
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                const nextState = !soundEnabled
                setSoundEnabled(nextState)
                if (nextState) playOrderChime()
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                soundEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-red-950/60 border-red-500/50 text-red-300 hover:bg-red-900/60'
              )}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Audio Alerts ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-red-400" />
                  <span>Muted</span>
                </>
              )}
            </button>

            {/* Test Sound Button */}
            <button
              onClick={() => playOrderChime({ volume: 0.5 })}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold flex items-center gap-1"
              title="Test Web Audio Chime"
            >
              <Bell className="w-3.5 h-3.5 text-brand-gold" />
              <span className="hidden md:inline">Test Bell</span>
            </button>

            {/* Live Time Display */}
            <div className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-sm font-bold text-brand-gold tabular-nums tracking-wider shadow-inner">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
        </div>

        {/* Flashing New Order Notification Banner */}
        {flashBanner && (
          <div className="mt-2 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red text-charcoal font-black text-center py-2 px-4 rounded-lg text-sm sm:text-base animate-pulse shadow-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-charcoal animate-spin" />
            <span>{flashBanner}</span>
            <Sparkles className="w-5 h-5 text-charcoal animate-spin" />
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-150',
              activeTab === 'ACTIVE'
                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Flame className="w-4 h-4 text-brand-gold" />
            <span>Active Orders</span>
            <span
              className={cn(
                'ml-1 px-2 py-0.5 rounded-full text-xs font-black tabular-nums',
                activeOrders.length > 0
                  ? 'bg-brand-gold text-charcoal'
                  : 'bg-white/20 text-white'
              )}
            >
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('READY')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-150',
              activeTab === 'READY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Ready / Pickup</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-black tabular-nums bg-white/20 text-white">
              {readyOrders.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main KDS Tickets Board */}
      <main className="flex-1 p-4 max-w-[1920px] mx-auto w-full">
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#181818] rounded-3xl border border-white/5 my-8">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <ChefHat className="w-10 h-10 text-white/40" />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {activeTab === 'ACTIVE'
                ? 'Kitchen is All Caught Up! 🍗'
                : 'No Ready Tickets'}
            </h2>
            <p className="text-sm text-white/50 max-w-md mt-1">
              {activeTab === 'ACTIVE'
                ? `All orders for ${currentBranch.name} have been prepared. New orders will appear here automatically with sound alerts.`
                : 'Completed tickets ready for runner pickup will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {displayedOrders.map((order) => (
              <KdsOrderTicket
                key={order.id}
                order={order}
                currentTime={currentTime}
                onAdvanceStatus={handleAdvanceStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Individual Kitchen Ticket Card with elapsed timer, high-contrast badges,
 * unmistakable Table highlight, and one-tap status action.
 */
interface KdsOrderTicketProps {
  order: KdsOrder
  currentTime: Date
  onAdvanceStatus: (orderId: string, nextStatus: 'PREPARING' | 'READY') => void
}

function KdsOrderTicket({
  order,
  currentTime,
  onAdvanceStatus,
}: KdsOrderTicketProps) {
  // Calculate elapsed time in minutes
  const orderTime = new Date(order.created_at).getTime()
  const now = currentTime.getTime()
  const elapsedMinutes = Math.max(0, Math.floor((now - orderTime) / 60000))

  // Color warning urgency
  // < 10 mins: Green
  // 10-20 mins: Amber
  // > 20 mins: Red pulsing
  const urgency =
    elapsedMinutes >= 20 ? 'urgent' : elapsedMinutes >= 10 ? 'warning' : 'normal'

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl bg-[#1c1c1c] border-2 shadow-xl overflow-hidden transition-all duration-200',
        urgency === 'urgent' &&
          'border-brand-red shadow-brand-red/30 ring-2 ring-brand-red/50 animate-pulse',
        urgency === 'warning' && 'border-amber-500/80 shadow-amber-500/20',
        urgency === 'normal' && 'border-emerald-500/60 shadow-black'
      )}
    >
      {/* Ticket Header */}
      <div
        className={cn(
          'p-3.5 border-b flex items-start justify-between gap-2',
          urgency === 'urgent'
            ? 'bg-brand-red text-white'
            : urgency === 'warning'
            ? 'bg-amber-500 text-charcoal'
            : 'bg-[#262626] text-white border-white/10'
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black tracking-tight">
              #{order.order_number.replace('CT-', '')}
            </span>
            <span
              className={cn(
                'text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded',
                urgency === 'urgent'
                  ? 'bg-white text-brand-red font-black'
                  : urgency === 'warning'
                  ? 'bg-charcoal text-amber-300'
                  : 'bg-white/15 text-white'
              )}
            >
              {order.status}
            </span>
          </div>

          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-bold mt-1',
              urgency === 'urgent'
                ? 'text-white'
                : urgency === 'warning'
                ? 'text-charcoal'
                : 'text-white/70'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono">
              {elapsedMinutes === 0 ? 'Just now' : `${elapsedMinutes}m ago`}
            </span>
            {urgency === 'urgent' && (
              <span className="bg-white text-brand-red font-black text-[10px] px-1 rounded animate-bounce">
                RUSH!
              </span>
            )}
          </div>
        </div>

        {/* Source & Fulfillment Icons */}
        <div className="flex flex-col items-end gap-1">
          {/* Order Source Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full',
              order.order_source === 'QR_TABLE'
                ? 'bg-brand-gold text-charcoal'
                : order.order_source === 'WHATSAPP'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            )}
          >
            {order.order_source === 'QR_TABLE' && (
              <QrCode className="w-2.5 h-2.5" />
            )}
            <span>{order.order_source.replace('_', ' ')}</span>
          </span>

          {/* Fulfillment Type */}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full',
              order.fulfillment_type === 'DELIVERY'
                ? 'bg-orange-600 text-white'
                : order.fulfillment_type === 'DINE_IN'
                ? 'bg-amber-600 text-white'
                : 'bg-purple-600 text-white'
            )}
          >
            {order.fulfillment_type === 'DELIVERY' && (
              <Bike className="w-3 h-3" />
            )}
            {order.fulfillment_type === 'PICKUP' && (
              <ShoppingBag className="w-3 h-3" />
            )}
            {order.fulfillment_type === 'DINE_IN' && (
              <Utensils className="w-3 h-3" />
            )}
            <span>{order.fulfillment_type}</span>
          </span>
        </div>
      </div>

      {/* ── UNMISTAKABLE GIANT TABLE BADGE FOR QR DINE-IN ── */}
      {order.table_number && (
        <div className="bg-brand-gold text-charcoal px-4 py-2.5 flex items-center justify-between border-b-2 border-charcoal/20 shadow-md">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-charcoal shrink-0" />
            <span className="text-xl md:text-2xl font-black tracking-tight uppercase leading-none">
              TABLE {order.table_number}
            </span>
          </div>
          <span className="bg-charcoal text-brand-gold text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
            DINE-IN RUNNER
          </span>
        </div>
      )}

      {/* Customer Info (Compact) */}
      <div className="px-3.5 py-1.5 bg-[#222222] border-b border-white/5 flex items-center justify-between text-xs text-white/60">
        <span className="font-semibold text-white/90 truncate max-w-[140px]">
          {order.customer_name}
        </span>
        <span className="font-mono text-[11px] text-white/50">
          {order.customer_phone}
        </span>
      </div>

      {/* Order Notes Callout (if any) */}
      {order.order_notes && (
        <div className="bg-amber-950/60 border-b border-amber-500/40 px-3.5 py-2 flex items-start gap-2 text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="font-medium leading-snug">
            <strong className="font-black text-amber-300 block uppercase text-[10px]">
              Chef Note:
            </strong>
            {order.order_notes}
          </div>
        </div>
      )}

      {/* Ticket Items List */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[340px] divide-y divide-white/5">
        {order.items.map((item, idx) => {
          // Normalize modifiers snapshot
          let modifiers: string[] = []
          if (Array.isArray(item.modifiers_snapshot)) {
            modifiers = item.modifiers_snapshot
              .map((m: { optionName?: string; name?: string }) => m.optionName || m.name || '')
              .filter(Boolean)
          }

          return (
            <div key={item.id || idx} className="pt-2 first:pt-0">
              <div className="flex items-start gap-2.5">
                {/* Quantity Badge */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10 font-mono text-base font-black text-brand-gold">
                  {item.quantity}x
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-white leading-tight">
                    {item.item_name}
                  </h4>
                  {item.variant_name && (
                    <span className="inline-block text-xs font-semibold text-brand-gold/90 mt-0.5">
                      ({item.variant_name})
                    </span>
                  )}

                  {/* Modifiers breakdown */}
                  {modifiers.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {modifiers.map((mod, modIdx) => (
                        <li
                          key={modIdx}
                          className="text-xs text-white/70 flex items-center gap-1 font-medium"
                        >
                          <span className="text-brand-gold">•</span>
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* One-Tap Advance Action Footer */}
      <div className="p-3 bg-[#171717] border-t border-white/10">
        {order.status === 'CONFIRMED' && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(order.id, 'PREPARING')}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-charcoal font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
          >
            <span>Start Preparing 👨‍🍳</span>
          </button>
        )}

        {order.status === 'PREPARING' && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(order.id, 'READY')}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-red hover:bg-red-700 active:bg-red-800 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-red/30 transition-transform active:scale-[0.98]"
          >
            <span>Mark Ready 🍗</span>
          </button>
        )}

        {order.status === 'READY' && (
          <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs uppercase text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready for Service / Runner</span>
          </div>
        )}
      </div>
    </div>
  )
}
