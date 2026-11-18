import { createClient as createServerSupabase } from '@/lib/supabase/server'
import OrderStatusCard from '@/components/storefront/OrderStatusCard'
import type { Order } from '@/types/database.types'
import Link from 'next/link'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single<Order>()

  return (
    <main style={{ minHeight: '100vh', background: '#121212', padding: '24px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Back link */}
        <Link href="/order" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
          ← Back to Menu
        </Link>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32 }}>🍗</div>
          <div style={{ color: '#C62828', fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>
            CHICKEN TOWN SL
          </div>
        </div>

        {/* Page title */}
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
          Track Order
        </h1>

        {/* Order status card — SSR with initial data, client subscribes for realtime */}
        <OrderStatusCard orderId={id} initialOrder={order ?? undefined} />

        {/* Help text */}
        <div style={{ marginTop: 24, textAlign: 'center', color: '#555', fontSize: 13 }}>
          Questions? Call us or WhatsApp the branch 📱
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('orders').select('order_number').eq('id', id).single()
  return {
    title: data ? `Order #${data.order_number} · Chicken Town SL` : 'Track Order · Chicken Town SL',
  }
}
