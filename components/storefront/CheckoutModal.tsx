'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/useCartStore'
import type { Order } from '@/types/database.types'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
}

type CheckoutStep = 'form' | 'awaiting_fee' | 'fee_quoted' | 'payment' | 'confirmed'

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const {
    items, fulfillmentType, branchId, branchName, tableNumber, orderSource, isScheduled,
    scheduledTime, getCartSubtotal, clearCart, addActiveOrderId,
    customerName: savedName, customerPhone: savedPhone, deliveryAddress: savedAddress,
  } = useCartStore()

  const [step, setStep] = useState<CheckoutStep>('form')
  const [name, setName] = useState(savedName)
  const [phone, setPhone] = useState(savedPhone)
  const [address, setAddress] = useState(savedAddress)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [quotedFee, setQuotedFee] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<'MONIME' | 'PAY_ON_ARRIVAL'>('PAY_ON_ARRIVAL')
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep('form')
      setName(savedName)
      setPhone(savedPhone)
      setAddress(savedAddress)
      setError('')
      setCurrentOrder(null)
    }
  }, [open, savedName, savedPhone, savedAddress])

  // Cleanup realtime on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  if (!open) return null

  const subtotal = getCartSubtotal()
  const isDelivery = fulfillmentType === 'DELIVERY'

  const validatePhone = (p: string) => /^(\+232|0)[0-9]{8,9}$/.test(p.replace(/\s+/g, ''))

  const subscribeToOrderUpdates = (orderId: string) => {
    const supabase = createClient()
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          const updated = payload.new as Order
          setCurrentOrder(updated)
          if (updated.status === 'FEE_QUOTED') {
            setQuotedFee(updated.delivery_fee)
            setStep('fee_quoted')
          } else if (updated.status === 'CONFIRMED') {
            setStep('confirmed')
            clearCart()
          }
        }
      )
      .subscribe()
    channelRef.current = channel
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePhone(phone)) {
      setError('Please enter a valid Sierra Leone phone number (+232 / 07... / 08...)')
      return
    }
    if (isDelivery && !address.trim()) {
      setError('Delivery address is required')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const orderNumber = `CT-${Date.now().toString(36).toUpperCase()}`
      const today = new Date().toISOString().split('T')[0]

      const orderPayload = {
        order_number: orderNumber,
        order_source: orderSource,
        fulfillment_type: fulfillmentType,
        branch_id: branchId,
        table_number: tableNumber,
        accounting_date: today,
        scheduled_for: isScheduled && scheduledTime ? new Date(`${today}T${scheduledTime}`).toISOString() : null,
        customer_name: name.trim(),
        customer_phone: phone.replace(/\s+/g, ''),
        delivery_address: isDelivery ? address.trim() : null,
        order_notes: notes.trim() || null,
        subtotal,
        delivery_fee: 0,
        total_amount: subtotal,
        payment_method: paymentMethod,
        payment_status: 'UNPAID' as const,
        status: isDelivery ? ('AWAITING_DELIVERY_FEE' as const) : ('PENDING_PAYMENT' as const),
      }

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single()

      if (orderErr || !order) throw orderErr ?? new Error('Order creation failed')

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        item_variant_id: item.variantId ?? null,
        item_name: item.name,
        variant_name: item.variantName ?? null,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.itemTotal,
        modifiers_snapshot: item.selectedModifiers.length > 0 ? item.selectedModifiers : null,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      setCurrentOrder(order)
      addActiveOrderId(order.id)

      if (isDelivery) {
        setStep('awaiting_fee')
        subscribeToOrderUpdates(order.id)
      } else {
        setStep('payment')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptFee = () => {
    setStep('payment')
  }

  const handleCancelOrder = async () => {
    if (!currentOrder) return
    const supabase = createClient()
    await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', currentOrder.id)
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    clearCart()
    onClose()
  }

  const handleConfirmPayment = async () => {
    if (!currentOrder) return
    setIsLoading(true)
    try {
      const supabase = createClient()

      if (paymentMethod === 'PAY_ON_ARRIVAL') {
        const { error: err } = await supabase
          .from('orders')
          .update({ status: 'CONFIRMED', payment_status: 'UNPAID' })
          .eq('id', currentOrder.id)
        if (err) throw err
        setStep('confirmed')
        clearCart()
      } else {
        // Monime online payment gateway
        const res = await fetch('/api/payments/monime/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: currentOrder.id }),
        })
        const data = await res.json()
        if (!data.success || !data.checkout_url) {
          throw new Error(data.error || 'Failed to initiate Monime checkout session')
        }
        clearCart()
        window.location.href = data.checkout_url
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget && step === 'form') onClose() }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />

      <div style={{
        position: 'relative', background: '#1a1a1a', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 520, maxHeight: '92vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Handle */}
        <div style={{ width: 48, height: 5, borderRadius: 3, background: '#444', margin: '12px auto 0' }} />

        {/* Title */}
        <div style={{ padding: '12px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
            {step === 'form' && 'Checkout'}
            {step === 'awaiting_fee' && 'Calculating Delivery Fee…'}
            {step === 'fee_quoted' && 'Delivery Fee Ready'}
            {step === 'payment' && 'Choose Payment'}
            {step === 'confirmed' && '🎉 Order Confirmed!'}
          </span>
          {step === 'form' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer' }}>×</button>
          )}
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>

          {/* ERROR */}
          {error && (
            <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* ORDER FORM */}
          {step === 'form' && (
            <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Order summary pill */}
              <div style={{ background: '#242424', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ color: '#888', fontSize: 12 }}>{fulfillmentType} · {branchName}</div>
                  {tableNumber && <div style={{ color: '#888', fontSize: 12 }}>Table {tableNumber}</div>}
                </div>
                <div style={{ color: '#FBC02D', fontWeight: 700 }}>Le {subtotal.toLocaleString()}</div>
              </div>

              <input type="text" placeholder="Your Name *" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
              <input type="tel" placeholder="Phone (+232 / 07... / 08...) *" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />

              {isDelivery && (
                <input type="text" placeholder="Delivery Address & Landmark *" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
              )}

              <textarea
                placeholder="Order notes / special instructions (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />

              {/* Subtotal display */}
              <div style={{ background: '#242424', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', marginBottom: 6 }}>
                  <span>Subtotal</span><span>Le {subtotal.toLocaleString()}</span>
                </div>
                {isDelivery && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 13 }}>
                    <span>Delivery fee</span><span>Calculated next</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isLoading || items.length === 0} style={primaryBtnStyle}>
                {isLoading ? 'Placing order…' : `Place Order · Le ${subtotal.toLocaleString()}`}
              </button>
            </form>
          )}

          {/* AWAITING FEE */}
          {step === 'awaiting_fee' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16, animation: 'spin 2s linear infinite' }}>📡</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                392 Dispatch is calculating your delivery fee…
              </div>
              <div style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
                Order #{currentOrder?.order_number} placed. Please wait a moment.
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#C62828', opacity: 0.6 + i * 0.2 }} />
                ))}
              </div>
              <button onClick={handleCancelOrder} style={{ marginTop: 32, background: 'none', border: '1px solid #444', color: '#888', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                Cancel Order
              </button>
            </div>
          )}

          {/* FEE QUOTED */}
          {step === 'fee_quoted' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛵</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Your Delivery Fee is Ready
              </div>
              <div style={{ background: '#242424', borderRadius: 12, padding: 20, margin: '20px 0', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', marginBottom: 8 }}>
                  <span>Subtotal</span><span>Le {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FBC02D', marginBottom: 8 }}>
                  <span>Delivery Fee</span><span>Le {quotedFee.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px solid #333', paddingTop: 10, display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: 18 }}>
                  <span>Total</span><span>Le {(subtotal + quotedFee).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCancelOrder} style={{ flex: 1, padding: '14px 0', borderRadius: 10, border: '1px solid #444', background: 'none', color: '#888', cursor: 'pointer', fontSize: 15 }}>
                  Cancel Order
                </button>
                <button onClick={handleAcceptFee} style={{ flex: 2, ...primaryBtnStyle, padding: '14px 0' }}>
                  Accept Fee & Choose Payment
                </button>
              </div>
            </div>
          )}

          {/* PAYMENT */}
          {step === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
                Order #{currentOrder?.order_number} · Total Le {((isDelivery ? quotedFee : 0) + subtotal).toLocaleString()}
              </div>

              {/* Payment options */}
              {(['MONIME', 'PAY_ON_ARRIVAL'] as const).map((method) => (
                <label key={method} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16,
                  borderRadius: 12, border: `2px solid ${paymentMethod === method ? '#C62828' : '#333'}`,
                  cursor: 'pointer', background: paymentMethod === method ? '#3a0a0a' : '#242424',
                }}>
                  <input type="radio" name="payment" value={method} checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)} style={{ marginTop: 3 }} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>
                      {method === 'MONIME' ? '💳 Pay Online (Monime)' : '💵 Pay Upon Arrival / Counter'}
                    </div>
                    <div style={{ color: '#888', fontSize: 13 }}>
                      {method === 'MONIME'
                        ? 'Orange Money, Afrimoney, Card — secure payment link'
                        : 'Cash or mobile money when your order arrives or at the counter'}
                    </div>
                  </div>
                </label>
              ))}

              <button onClick={handleConfirmPayment} disabled={isLoading} style={primaryBtnStyle}>
                {isLoading ? 'Processing…'
                  : paymentMethod === 'PAY_ON_ARRIVAL' ? 'Confirm Order — Pay Later'
                  : `Pay Now · Le ${((isDelivery ? quotedFee : 0) + subtotal).toLocaleString()}`}
              </button>
            </div>
          )}

          {/* CONFIRMED */}
          {step === 'confirmed' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
              <div style={{ color: '#4caf50', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Order Confirmed!
              </div>
              <div style={{ color: '#ccc', marginBottom: 8 }}>
                Order #{currentOrder?.order_number}
              </div>
              <div style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>
                SWIT U MOT SWIT U LYF 🍗
              </div>
              <a
                href={`/orders/${currentOrder?.id}`}
                style={{ display: 'block', padding: '14px 0', borderRadius: 10, background: '#C62828', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', textAlign: 'center', marginBottom: 12 }}
              >
                Track Your Order
              </a>
              <button onClick={onClose} style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1px solid #444', background: 'none', color: '#888', cursor: 'pointer', fontSize: 14 }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: 10, border: '1px solid #333', background: '#242424',
  color: '#fff', fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '14px 0', borderRadius: 10, border: 'none', background: '#C62828',
  color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, width: '100%',
}
