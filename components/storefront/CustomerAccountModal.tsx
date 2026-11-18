'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import type { Order } from '@/types/database.types'

interface CustomerAccountModalProps {
  open: boolean
  onClose: () => void
}

type AuthTab = 'login' | 'profile' | 'orders'
type LoginMode = 'phone' | 'email'

export default function CustomerAccountModal({ open, onClose }: CustomerAccountModalProps) {
  const { user, orderHistory, isLoading, error, loginWithPhone, loginWithEmail, signup, logout, updateProfile, fetchOrderHistory, clearError } = useAuthStore()

  const [tab, setTab] = useState<AuthTab>(user ? 'profile' : 'login')
  const [loginMode, setLoginMode] = useState<LoginMode>('phone')
  const [isSignup, setIsSignup] = useState(false)

  // Form fields
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (user) {
      setTab('profile')
      setName(user.name)
      setPhone(user.phone)
      setEmail(user.email ?? '')
      setAddress(user.address ?? '')
    } else {
      setTab('login')
    }
  }, [user])

  useEffect(() => {
    if (tab === 'orders' && user) {
      fetchOrderHistory()
    }
  }, [tab, user, fetchOrderHistory])

  if (!open) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (loginMode === 'phone') {
      await loginWithPhone(phone, password)
    } else {
      await loginWithEmail(email, password)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    await signup(email, password, name, phone)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile({ name, phone, address })
  }

  const handleReorder = (order: Order) => {
    // Note: full reorder requires menu-data to look up items; this loads order info to cart
    console.log('Reordering:', order.id)
    // A full implementation would re-hydrate order_items into cart items
    onClose()
  }

  const formatStatus = (status: string) => status.replace(/_/g, ' ')

  const statusColor = (status: string) => {
    if (['COMPLETED'].includes(status)) return '#4caf50'
    if (['CANCELLED'].includes(status)) return '#f44336'
    if (['PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(status)) return '#ff9800'
    return '#2196f3'
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />

      {/* Modal */}
      <div style={{
        position: 'relative', background: '#1a1a1a', borderRadius: 16, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)', margin: '0 16px',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>My Account</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '12px 24px 0', borderBottom: '1px solid #333' }}>
          {user && (
            <>
              {(['profile', 'orders'] as AuthTab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #C62828' : '2px solid transparent',
                  color: tab === t ? '#fff' : '#888', cursor: 'pointer', padding: '8px 16px', fontSize: 14, fontWeight: 600,
                  textTransform: 'capitalize',
                }}>
                  {t === 'orders' ? 'Order History' : 'Profile'}
                </button>
              ))}
            </>
          )}
          {!user && (
            <button style={{
              background: 'none', border: 'none', borderBottom: '2px solid #C62828',
              color: '#fff', cursor: 'pointer', padding: '8px 16px', fontSize: 14, fontWeight: 600,
            }}>
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>

          {/* ERROR BANNER */}
          {error && (
            <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* LOGIN / SIGNUP */}
          {!user && (
            <div>
              {/* Login mode toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['phone', 'email'] as LoginMode[]).map((m) => (
                  <button key={m} onClick={() => setLoginMode(m)} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                    background: loginMode === m ? '#C62828' : '#2a2a2a',
                    color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {m === 'phone' ? '📱 Phone' : '✉️ Email'}
                  </button>
                ))}
              </div>

              <form onSubmit={isSignup ? handleSignup : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {isSignup && (
                  <input
                    type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                    required style={inputStyle}
                  />
                )}
                {(loginMode === 'phone' || isSignup) && (
                  <input
                    type="tel" placeholder="Phone (+232 / 07... / 08...)" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={loginMode === 'phone' || isSignup} style={inputStyle}
                  />
                )}
                {(loginMode === 'email' || isSignup) && (
                  <input
                    type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required={loginMode === 'email' || isSignup} style={inputStyle}
                  />
                )}
                <input
                  type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required style={inputStyle}
                />
                <button type="submit" disabled={isLoading} style={primaryBtnStyle}>
                  {isLoading ? 'Please wait…' : isSignup ? 'Create Account' : 'Login'}
                </button>
              </form>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button onClick={() => { setIsSignup(!isSignup); clearError() }} style={{ background: 'none', border: 'none', color: '#FBC02D', cursor: 'pointer', fontSize: 14 }}>
                  {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {user && tab === 'profile' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{user.name}</div>
                  <div style={{ color: '#888', fontSize: 13 }}>{user.phone}</div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Saved Delivery Address / Landmark" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
                <button type="submit" disabled={isLoading} style={primaryBtnStyle}>
                  {isLoading ? 'Saving…' : 'Save Profile'}
                </button>
              </form>

              <div style={{ marginTop: 24, borderTop: '1px solid #333', paddingTop: 20 }}>
                <button onClick={logout} style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1px solid #444', background: 'none', color: '#888', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* ORDER HISTORY */}
          {user && tab === 'orders' && (
            <div>
              {isLoading && <div style={{ textAlign: 'center', color: '#888', padding: 32 }}>Loading orders…</div>}
              {!isLoading && orderHistory.length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🍗</div>
                  <div>No orders yet. SWIT U MOT SWIT U LYF!</div>
                </div>
              )}
              {orderHistory.map((order) => (
                <div key={order.id} style={{ background: '#242424', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700 }}>#{order.order_number}</div>
                      <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColor(order.status) + '33', color: statusColor(order.status) }}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={{ color: '#FBC02D', fontWeight: 700, fontSize: 16 }}>Le {order.total_amount.toLocaleString()}</div>
                    <button onClick={() => handleReorder(order)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#C62828', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      🔄 Reorder
                    </button>
                  </div>
                </div>
              ))}
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
