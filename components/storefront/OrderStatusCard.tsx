'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types/database.types'

interface OrderStatusCardProps {
  orderId: string
  initialOrder?: Order
}

type OrderStatus = Order['status']

const STATUS_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'AWAITING_DELIVERY_FEE', label: 'Fee Requested', icon: '📡' },
  { status: 'FEE_QUOTED',            label: 'Fee Quoted',    icon: '💰' },
  { status: 'PENDING_PAYMENT',       label: 'Pending Payment', icon: '💳' },
  { status: 'CONFIRMED',             label: 'Confirmed',     icon: '✅' },
  { status: 'PREPARING',             label: 'Preparing',     icon: '👨‍🍳' },
  { status: 'READY',                 label: 'Ready',         icon: '📦' },
  { status: 'OUT_FOR_DELIVERY',      label: 'Out for Delivery', icon: '🛵' },
  { status: 'COMPLETED',             label: 'Delivered!',    icon: '🎉' },
]

const PICKUP_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'PENDING_PAYMENT',  label: 'Pending Payment', icon: '💳' },
  { status: 'CONFIRMED',        label: 'Confirmed',       icon: '✅' },
  { status: 'PREPARING',        label: 'Preparing',       icon: '👨‍🍳' },
  { status: 'READY',            label: 'Ready for Pickup', icon: '📦' },
  { status: 'COMPLETED',        label: 'Collected!',       icon: '🎉' },
]

const DINE_IN_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'PENDING_PAYMENT', label: 'Pending Payment', icon: '💳' },
  { status: 'CONFIRMED',       label: 'Order Received',  icon: '✅' },
  { status: 'PREPARING',       label: 'Being Prepared',  icon: '👨‍🍳' },
  { status: 'READY',           label: 'Ready to Serve',  icon: '🍗' },
  { status: 'COMPLETED',       label: 'Enjoy your meal!', icon: '🎉' },
]

function getStepsForFulfillment(type: string) {
  if (type === 'PICKUP') return PICKUP_STEPS
  if (type === 'DINE_IN') return DINE_IN_STEPS
  return STATUS_STEPS
}

function getStatusIndex(steps: typeof STATUS_STEPS, status: OrderStatus) {
  const idx = steps.findIndex((s) => s.status === status)
  return idx === -1 ? 0 : idx
}

export default function OrderStatusCard({ orderId, initialOrder }: OrderStatusCardProps) {
  const [order, setOrder] = useState<Order | null>(initialOrder ?? null)
  const [isLoading, setIsLoading] = useState(!initialOrder)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch if no initialOrder passed
    if (!initialOrder) {
      supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
        .then(({ data }) => {
          if (data) setOrder(data)
          setIsLoading(false)
        })
    }

    // Realtime subscription
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(payload.new as Order)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, initialOrder])

  if (isLoading) {
    return (
      <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, textAlign: 'center', color: '#888' }}>
        Loading order…
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, textAlign: 'center' }}>
        <div style={{ color: '#f44336', marginBottom: 8 }}>Order not found</div>
        <div style={{ color: '#888', fontSize: 14 }}>Order ID: {orderId}</div>
      </div>
    )
  }

  const isCancelled = order.status === 'CANCELLED'
  const steps = getStepsForFulfillment(order.fulfillment_type)
  const currentStepIdx = isCancelled ? -1 : getStatusIndex(steps, order.status)

  const fulfillmentLabel = order.fulfillment_type === 'DELIVERY'
    ? '🛵 Delivery'
    : order.fulfillment_type === 'PICKUP'
    ? '🏪 Pickup'
    : `🍽️ Dine-In${order.table_number ? ` · Table ${order.table_number}` : ''}`

  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      {/* Header */}
      <div style={{ background: '#C62828', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>Order</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>#{order.order_number}</div>
          </div>
          {isCancelled ? (
            <span style={{ background: '#7f1d1d', color: '#fecaca', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              CANCELLED
            </span>
          ) : (
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              {steps[currentStepIdx]?.label ?? order.status.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Order meta */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>Type</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{fulfillmentLabel}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>Branch</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{order.branch_id}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>Payment</div>
            <div style={{ color: order.payment_status === 'PAID' ? '#4caf50' : '#FBC02D', fontSize: 14, fontWeight: 600 }}>
              {order.payment_status} · {order.payment_method.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      {!isCancelled && (
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ marginBottom: 16, color: '#888', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Order Progress
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((step, idx) => {
              const isDone = idx < currentStepIdx
              const isActive = idx === currentStepIdx
              const isFuture = idx > currentStepIdx
              return (
                <div key={step.status} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: idx < steps.length - 1 ? 20 : 0, position: 'relative' }}>
                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 19, top: 36, width: 2, height: 'calc(100% - 20px)',
                      background: isDone ? '#C62828' : '#333',
                    }} />
                  )}
                  {/* Circle */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? '#C62828' : isDone ? '#7f1d1d' : '#242424',
                    border: `2px solid ${isActive ? '#C62828' : isDone ? '#C62828' : '#333'}`,
                    fontSize: 18, zIndex: 1, position: 'relative',
                    boxShadow: isActive ? '0 0 0 4px rgba(198,40,40,0.2)' : 'none',
                  }}>
                    {isDone ? '✓' : step.icon}
                  </div>
                  {/* Label */}
                  <div style={{ paddingTop: 10 }}>
                    <div style={{
                      color: isActive ? '#fff' : isDone ? '#ccc' : '#555',
                      fontWeight: isActive ? 700 : 400,
                      fontSize: 15,
                    }}>
                      {step.label}
                    </div>
                    {isActive && (
                      <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                        {new Date(order.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Totals */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 6 }}>
          <span>Subtotal</span><span>Le {order.subtotal.toLocaleString()}</span>
        </div>
        {order.fulfillment_type === 'DELIVERY' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: 6 }}>
            <span>Delivery Fee</span>
            <span>{order.delivery_fee > 0 ? `Le ${order.delivery_fee.toLocaleString()}` : 'Calculating…'}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FBC02D', fontWeight: 700, fontSize: 18, marginTop: 10, paddingTop: 10, borderTop: '1px solid #2a2a2a' }}>
          <span>Total</span><span>Le {order.total_amount.toLocaleString()}</span>
        </div>

        {/* Customer */}
        <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
          {order.customer_name} · {order.customer_phone}
          {order.delivery_address && <div style={{ marginTop: 4 }}>📍 {order.delivery_address}</div>}
        </div>
      </div>
    </div>
  )
}
