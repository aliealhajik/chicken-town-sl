'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStaffStore } from '@/store/useStaffStore'
import { BRANCHES } from '@/lib/data/branches'
import { playOrderChime } from '@/lib/audio-chime'
import type { Order, OrderItem } from '@/types/database.types'

interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

type TabType =
  | 'ALL_ACTIVE'
  | 'NEEDS_FEE'
  | 'IN_KITCHEN'
  | 'READY_DISPATCH'
  | 'COMPLETED'

const FEE_SUGGESTIONS = [20, 30, 40, 50, 75, 100]

export default function CashierClient() {
  const { currentStaff, activeAccountingDate } = useStaffStore()
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    currentStaff?.branch_id || 'b1000000-0000-0000-0000-000000000007'
  )
  const [activeTab, setActiveTab] = useState<TabType>('ALL_ACTIVE')
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [feeInputs, setFeeInputs] = useState<Record<string, number | string>>({})
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [notification, setNotification] = useState<string | null>(null)

  const isSuperAdmin = currentStaff?.role === 'SUPER_ADMIN'
  const isDeliveryHub = useMemo(() => {
    if (isSuperAdmin && selectedBranchId === 'ALL') return true
    const branch = BRANCHES.find((b) => b.id === selectedBranchId)
    return branch?.is_delivery_hub || selectedBranchId === 'b1000000-0000-0000-0000-000000000007'
  }, [selectedBranchId, isSuperAdmin])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (!isSuperAdmin || selectedBranchId !== 'ALL') {
        query = query.eq('branch_id', selectedBranchId)
      }

      const { data, error } = await query
      if (error) {
        console.error('Error fetching cashier orders:', error)
      } else if (data) {
        setOrders(data as OrderWithItems[])
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranchId, isSuperAdmin])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Real-time updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('cashier-orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            if (
              isSuperAdmin ||
              selectedBranchId === 'ALL' ||
              newOrder.branch_id === selectedBranchId
            ) {
              playOrderChime()
              showToast(`New Order #${newOrder.order_number} received!`)
              fetchOrders()
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setOrders((prev) => prev.filter((o) => o.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedBranchId, isSuperAdmin, fetchOrders])

  // Actions
  const handleSendDeliveryFee = async (order: OrderWithItems) => {
    const feeValue = Number(feeInputs[order.id])
    if (isNaN(feeValue) || feeValue <= 0) {
      alert('Please enter a valid delivery fee in Le.')
      return
    }

    setActionLoading((prev) => ({ ...prev, [order.id]: true }))
    const supabase = createClient()
    const newTotal = Number(order.subtotal) + feeValue

    const { error } = await (supabase.from('orders') as any)
      .update({
        delivery_fee: feeValue,
        total_amount: newTotal,
        status: 'FEE_QUOTED',
      })
      .eq('id', order.id)

    setActionLoading((prev) => ({ ...prev, [order.id]: false }))

    if (error) {
      alert('Failed to send quote: ' + error.message)
    } else {
      showToast(`Sent quote Le ${feeValue} for Order #${order.order_number}`)

      // If WhatsApp order, notify customer with interactive payment buttons
      if (order.order_source === 'WHATSAPP') {
        try {
          await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'fee_quote',
              data: {
                orderId: order.id,
                orderNumber: order.order_number,
                customerPhone: order.customer_phone,
                subtotal: Number(order.subtotal),
                deliveryFee: feeValue,
                totalAmount: newTotal,
              },
            }),
          })
          showToast(`WhatsApp quote delivered to ${order.customer_phone} 📲`)
        } catch (err) {
          console.error('WhatsApp notify error:', err)
        }
      }

      setFeeInputs((prev) => {
        const next = { ...prev }
        delete next[order.id]
        return next
      })
      fetchOrders()
    }
  }

  const handleSettlePayment = async (orderId: string, orderNumber: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }))
    const supabase = createClient()
    const { error } = await (supabase.from('orders') as any)
      .update({
        payment_status: 'PAID',
      })
      .eq('id', orderId)

    setActionLoading((prev) => ({ ...prev, [orderId]: false }))
    if (error) {
      alert('Failed to settle payment: ' + error.message)
    } else {
      showToast(`Payment collected for Order #${orderNumber}!`)
      fetchOrders()
    }
  }

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: Order['status'],
    successMessage: string
  ) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }))
    const supabase = createClient()
    const { error } = await (supabase.from('orders') as any)
      .update({ status: newStatus })
      .eq('id', orderId)

    setActionLoading((prev) => ({ ...prev, [orderId]: false }))
    if (error) {
      alert('Failed to update status: ' + error.message)
    } else {
      showToast(successMessage)

      // Notify WhatsApp customer if applicable
      const targetOrder = orders.find((o) => o.id === orderId)
      if (targetOrder && targetOrder.order_source === 'WHATSAPP') {
        try {
          const branch = BRANCHES.find((b) => b.id === targetOrder.branch_id)
          await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'status_update',
              data: {
                customerPhone: targetOrder.customer_phone,
                orderNumber: targetOrder.order_number,
                status: newStatus,
                branchName: branch?.name || 'Chicken Town SL',
                fulfillmentType: targetOrder.fulfillment_type,
                deliveryAddress: targetOrder.delivery_address || undefined,
              },
            }),
          })
        } catch (err) {
          console.error('WhatsApp status notify error:', err)
        }
      }

      fetchOrders()
    }
  }

  // Filtered lists
  const needsFeeOrders = useMemo(
    () => orders.filter((o) => o.status === 'AWAITING_DELIVERY_FEE'),
    [orders]
  )

  const inKitchenOrders = useMemo(
    () => orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING'),
    [orders]
  )

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY'),
    [orders]
  )

  const completedTodayOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === 'COMPLETED' &&
          (!activeAccountingDate || o.accounting_date === activeAccountingDate)
      ),
    [orders, activeAccountingDate]
  )

  const allActiveOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
      ),
    [orders]
  )

  const visibleOrders = useMemo(() => {
    switch (activeTab) {
      case 'NEEDS_FEE':
        return needsFeeOrders
      case 'IN_KITCHEN':
        return inKitchenOrders
      case 'READY_DISPATCH':
        return readyOrders
      case 'COMPLETED':
        return completedTodayOrders
      case 'ALL_ACTIVE':
      default:
        return allActiveOrders
    }
  }, [
    activeTab,
    needsFeeOrders,
    inKitchenOrders,
    readyOrders,
    completedTodayOrders,
    allActiveOrders,
  ])

  return (
    <div className="min-h-screen bg-charcoal p-4 text-white md:p-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-brand-red px-5 py-3 font-semibold text-white shadow-2xl shadow-red-950 animate-bounce">
          {notification}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white md:text-3xl">
              Cashier & Dispatch Portal
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Freetown POS, delivery fee quoting, cash counter settlements & live dispatch
          </p>
        </div>

        {/* Branch Scope Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Branch Scope:
              </span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm font-medium text-white focus:border-brand-gold focus:outline-none"
              >
                <option value="ALL">🌐 All Branches (Consolidated)</option>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.is_delivery_hub ? '🛵 (Hub)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 border border-white/10">
              <span className="text-xs text-gray-400">Current Branch:</span>
              <span className="font-bold text-brand-gold">
                {BRANCHES.find((b) => b.id === selectedBranchId)?.name || '392 Hub'}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              playOrderChime()
              fetchOrders()
            }}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 active:scale-95 transition"
            title="Refresh orders and test sound chime"
          >
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* Prominent 392 Delivery Fee Banner if any waiting */}
      {isDeliveryHub && needsFeeOrders.length > 0 && (
        <div className="mb-6 rounded-2xl border-2 border-brand-gold/60 bg-gradient-to-r from-amber-950/70 via-black/80 to-amber-950/70 p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <span className="animate-pulse text-3xl">🛵</span>
              <div>
                <h2 className="text-lg font-black text-brand-gold uppercase tracking-wide">
                  392 Dispatch: {needsFeeOrders.length} Order{needsFeeOrders.length > 1 ? 's' : ''} Awaiting Delivery Fee
                </h2>
                <p className="text-xs text-gray-300">
                  Customer is on the live waiting screen right now! Quote the fee to proceed.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('NEEDS_FEE')}
              className="rounded-lg bg-brand-gold px-4 py-1.5 text-xs font-black uppercase text-black hover:bg-yellow-400 active:scale-95 transition"
            >
              Focus on Fee Quotes ({needsFeeOrders.length})
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('ALL_ACTIVE')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'ALL_ACTIVE'
              ? 'bg-brand-red text-white shadow-lg'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span>📋 All Active</span>
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">
            {allActiveOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('NEEDS_FEE')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'NEEDS_FEE'
              ? 'bg-brand-gold text-black shadow-lg'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span>🛵 Needs Delivery Fee</span>
          {needsFeeOrders.length > 0 && (
            <span className="rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-black text-white animate-pulse">
              {needsFeeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('IN_KITCHEN')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'IN_KITCHEN'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span>👨‍🍳 In Kitchen</span>
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">
            {inKitchenOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('READY_DISPATCH')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'READY_DISPATCH'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span>📦 Ready / Out</span>
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">
            {readyOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'COMPLETED'
              ? 'bg-gray-600 text-white shadow-lg'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span>✅ Completed Today</span>
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">
            {completedTodayOrders.length}
          </span>
        </button>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="animate-spin text-3xl mb-2">⏳</div>
            <p>Loading live orders from Supabase...</p>
          </div>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/5 bg-black/20 p-8 text-center">
          <span className="text-4xl mb-2">🍗</span>
          <p className="text-lg font-bold text-gray-300">No orders found in this view</p>
          <p className="text-xs text-gray-500 mt-1">SWIT U MOT SWIT U LYF · Waiting for new tickets</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleOrders.map((order) => {
            const isAwaitingFee = order.status === 'AWAITING_DELIVERY_FEE'
            const isUnpaidArrival =
              order.payment_method === 'PAY_ON_ARRIVAL' && order.payment_status === 'UNPAID'
            const currentFee = feeInputs[order.id] ?? ''
            const isActionBusy = !!actionLoading[order.id]

            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between rounded-2xl border bg-black/40 p-5 shadow-xl transition-all ${
                  isAwaitingFee
                    ? 'border-brand-gold ring-1 ring-brand-gold/60 bg-gradient-to-b from-amber-950/20 to-black/60'
                    : isUnpaidArrival
                    ? 'border-red-500/60 ring-1 ring-red-500/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-brand-gold">
                          #{order.order_number}
                        </span>
                        {order.table_number && (
                          <span className="rounded-md bg-brand-gold px-2 py-0.5 text-xs font-black text-black">
                            TABLE {order.table_number}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · Source: <span className="font-bold text-gray-300">{order.order_source}</span>
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'AWAITING_DELIVERY_FEE'
                            ? 'bg-amber-500 text-black animate-pulse'
                            : order.status === 'FEE_QUOTED'
                            ? 'bg-yellow-600/80 text-white'
                            : order.status === 'CONFIRMED'
                            ? 'bg-blue-600 text-white'
                            : order.status === 'PREPARING'
                            ? 'bg-purple-600 text-white'
                            : order.status === 'READY'
                            ? 'bg-emerald-500 text-black font-extrabold'
                            : order.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-sky-500 text-black font-extrabold'
                            : order.status === 'COMPLETED'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-red-800 text-white'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          order.fulfillment_type === 'DELIVERY'
                            ? 'bg-orange-950 text-orange-300 border border-orange-700/50'
                            : order.fulfillment_type === 'PICKUP'
                            ? 'bg-blue-950 text-blue-300 border border-blue-700/50'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        }`}
                      >
                        {order.fulfillment_type === 'DELIVERY' && '🛵 '}
                        {order.fulfillment_type === 'PICKUP' && '🛍️ '}
                        {order.fulfillment_type === 'DINE_IN' && '🍽️ '}
                        {order.fulfillment_type}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 rounded-xl bg-white/5 p-3 text-xs border border-white/5">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">{order.customer_name}</span>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="font-mono text-brand-gold hover:underline"
                      >
                        📞 {order.customer_phone}
                      </a>
                    </div>
                    {order.delivery_address && (
                      <div className="mt-1.5 flex items-start gap-1 text-gray-300">
                        <span className="text-red-400">📍</span>
                        <span className="leading-tight">{order.delivery_address}</span>
                      </div>
                    )}
                    {order.order_notes && (
                      <div className="mt-1.5 rounded bg-black/40 p-1.5 font-medium italic text-yellow-200">
                        &ldquo;{order.order_notes}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {order.order_items && order.order_items.length > 0 ? (
                      order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between border-b border-white/5 pb-1 text-xs"
                        >
                          <div>
                            <span className="font-bold text-brand-gold">{item.quantity}x</span>{' '}
                            <span className="font-medium text-white">{item.item_name}</span>
                            {item.variant_name && (
                              <span className="ml-1 text-[11px] text-gray-400">
                                ({item.variant_name})
                              </span>
                            )}
                            {item.modifiers_snapshot &&
                              Array.isArray(item.modifiers_snapshot) &&
                              item.modifiers_snapshot.length > 0 && (
                                <div className="text-[10px] text-gray-400 pl-4">
                                  {(item.modifiers_snapshot as { optionName?: string; name?: string }[])
                                    .map((m) => m.optionName || m.name)
                                    .filter(Boolean)
                                    .join(', ')}
                                </div>
                              )}
                          </div>
                          <span className="font-mono text-gray-300">
                            Le {Number(item.line_total).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No items snapshot recorded</p>
                    )}
                  </div>

                  {/* Payment & Financials */}
                  <div className="mb-4 rounded-xl bg-black/50 p-3 border border-white/10 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="font-mono">Le {Number(order.subtotal).toLocaleString()}</span>
                    </div>
                    {order.fulfillment_type === 'DELIVERY' && (
                      <div className="flex justify-between text-gray-400 mt-1">
                        <span>Delivery Fee</span>
                        <span className="font-mono text-brand-gold">
                          {order.delivery_fee > 0
                            ? `Le ${Number(order.delivery_fee).toLocaleString()}`
                            : 'Pending'}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-black text-sm text-white">
                      <span>Total Amount</span>
                      <span className="font-mono text-brand-gold">
                        Le {Number(order.total_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        Method: <strong className="text-gray-200">{order.payment_method}</strong>
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                          order.payment_status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                            : 'bg-red-950 text-red-400 border border-red-700/60'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cashier Action Controls */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  {/* 1. DELIVERY FEE QUOTING SECTION */}
                  {isAwaitingFee && (
                    <div className="rounded-xl border border-brand-gold/60 bg-brand-gold/10 p-3">
                      <div className="mb-2 text-xs font-bold text-brand-gold uppercase">
                        Quote Delivery Fee:
                      </div>

                      {/* Quick preset buttons */}
                      <div className="mb-2 flex flex-wrap gap-1">
                        {FEE_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setFeeInputs((prev) => ({ ...prev, [order.id]: s }))
                            }
                            className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                              Number(currentFee) === s
                                ? 'bg-brand-gold text-black'
                                : 'bg-black/60 text-white hover:bg-white/20'
                            }`}
                          >
                            Le {s}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Fee in Le"
                          value={currentFee}
                          onChange={(e) =>
                            setFeeInputs((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="w-28 rounded-lg border border-white/20 bg-black/80 px-2 py-1 text-sm font-bold text-white focus:border-brand-gold focus:outline-none"
                        />
                        <button
                          disabled={isActionBusy}
                          onClick={() => handleSendDeliveryFee(order)}
                          className="flex-1 rounded-lg bg-brand-gold py-1.5 px-3 text-xs font-black uppercase tracking-wider text-black hover:bg-yellow-400 active:scale-95 transition disabled:opacity-50"
                        >
                          {isActionBusy ? 'Sending...' : 'Send Quote 🚀'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. PAY-ON-ARRIVAL SETTLEMENT */}
                  {isUnpaidArrival && order.status !== 'AWAITING_DELIVERY_FEE' && (
                    <button
                      disabled={isActionBusy}
                      onClick={() => handleSettlePayment(order.id, order.order_number)}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:from-emerald-500 hover:to-green-500 active:scale-95 transition disabled:opacity-50"
                    >
                      💵 Collect Cash & Settle (Le {Number(order.total_amount).toLocaleString()})
                    </button>
                  )}

                  {/* 3. DISPATCH & COMPLETION ACTIONS */}
                  <div className="grid grid-cols-1 gap-2">
                    {order.fulfillment_type === 'DELIVERY' ? (
                      <>
                        {order.status === 'READY' && (
                          <button
                            disabled={isActionBusy}
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                'OUT_FOR_DELIVERY',
                                `Order #${order.order_number} marked Out for Delivery 🛵`
                              )
                            }
                            className="rounded-xl bg-sky-600 py-2 text-xs font-extrabold uppercase text-white hover:bg-sky-500 active:scale-95 transition disabled:opacity-50"
                          >
                            Dispatch (Out for Delivery 🛵)
                          </button>
                        )}

                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <button
                            disabled={isActionBusy}
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                'COMPLETED',
                                `Order #${order.order_number} Completed & Delivered 🎉`
                              )
                            }
                            className="rounded-xl bg-emerald-600 py-2 text-xs font-extrabold uppercase text-white hover:bg-emerald-500 active:scale-95 transition disabled:opacity-50"
                          >
                            Mark Delivered / Completed 🎉
                          </button>
                        )}
                      </>
                    ) : (
                      /* PICKUP OR DINE IN */
                      order.status === 'READY' && (
                        <button
                          disabled={isActionBusy}
                          onClick={() =>
                            handleUpdateStatus(
                              order.id,
                              'COMPLETED',
                              `Order #${order.order_number} Handed Over & Completed ✅`
                            )
                          }
                          className="rounded-xl bg-emerald-600 py-2 text-xs font-extrabold uppercase text-white hover:bg-emerald-500 active:scale-95 transition disabled:opacity-50"
                        >
                          Mark Handed Over / Completed ✅
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
