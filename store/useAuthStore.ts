import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

interface AuthUser {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
}

interface AuthState {
  user: AuthUser | null
  orderHistory: Order[]
  isLoading: boolean
  error: string | null

  // Actions
  loginWithPhone: (phone: string, password: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  fetchOrderHistory: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      orderHistory: [],
      isLoading: false,
      error: null,

      loginWithPhone: async (phone: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const supabase = createClient()
          // phone login via email format convention: phone@chickentownsl.com
          const { data, error } = await supabase.auth.signInWithPassword({
            email: `${phone.replace(/\s+/g, '')}@chickentownsl.com`,
            password,
          })
          if (error) throw error
          if (data.user) {
            const { data: profile } = await supabase
              .from('staff_profiles')
              .select('full_name, phone')
              .eq('id', data.user.id)
              .single()
            set({
              user: {
                id: data.user.id,
                name: profile?.full_name ?? data.user.user_metadata?.full_name ?? '',
                phone: profile?.phone ?? phone,
                email: data.user.email,
              },
              isLoading: false,
            })
          }
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false })
        }
      },

      loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          if (data.user) {
            set({
              user: {
                id: data.user.id,
                name: data.user.user_metadata?.full_name ?? '',
                phone: data.user.user_metadata?.phone ?? '',
                email: data.user.email,
                address: data.user.user_metadata?.address,
              },
              isLoading: false,
            })
          }
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false })
        }
      },

      signup: async (email: string, password: string, name: string, phone: string) => {
        set({ isLoading: true, error: null })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name, phone } },
          })
          if (error) throw error
          if (data.user) {
            set({
              user: {
                id: data.user.id,
                name,
                phone,
                email,
              },
              isLoading: false,
            })
          }
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Signup failed', isLoading: false })
        }
      },

      logout: async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null, orderHistory: [] })
      },

      updateProfile: async (data: Partial<AuthUser>) => {
        set({ isLoading: true, error: null })
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.updateUser({
            data: {
              full_name: data.name,
              phone: data.phone,
              address: data.address,
            },
          })
          if (error) throw error
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
            isLoading: false,
          }))
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Update failed', isLoading: false })
        }
      },

      fetchOrderHistory: async () => {
        const user = get().user
        if (!user) return
        set({ isLoading: true })
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_phone', user.phone)
            .order('created_at', { ascending: false })
            .limit(20)
          if (error) throw error
          set({ orderHistory: data ?? [], isLoading: false })
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Fetch failed', isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ct-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
