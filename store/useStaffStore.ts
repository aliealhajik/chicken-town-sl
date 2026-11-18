import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BRANCHES, getBranchBySlug } from '@/lib/data/branches'
import { createClient } from '@/lib/supabase/client'
import type { StaffRole } from '@/types'

export interface StaffUser {
  id: string
  email: string
  full_name: string
  role: StaffRole
  branch_id: string | null
  branch_name: string | null
  branch_slug?: string | null
}

export interface DemoPreset {
  id: string
  email: string
  full_name: string
  role: StaffRole
  branch_id: string | null
  branch_name: string
  branch_slug: string | null
  description: string
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-admin',
    email: 'admin@chickentownsl.com',
    full_name: 'Aminata Kamara (Admin)',
    role: 'SUPER_ADMIN',
    branch_id: null,
    branch_name: 'All Branches (HQ)',
    branch_slug: null,
    description: 'Full oversight: multi-branch analytics, menu edit, Z-reports, staff management.',
  },
  {
    id: 'demo-cashier-392',
    email: 'cashier392@chickentownsl.com',
    full_name: 'Mohamed Sesay (392 Cashier)',
    role: 'CASHIER',
    branch_id: 'b1000000-0000-0000-0000-000000000007',
    branch_name: '392 Main Delivery Hub',
    branch_slug: '392',
    description: '392 Delivery Hub dispatch, delivery fee quotes, POS orders & payment logging.',
  },
  {
    id: 'demo-kitchen-lumley',
    email: 'kitchen.lumley@chickentownsl.com',
    full_name: 'Fatmata Turay (Head Chef)',
    role: 'KITCHEN',
    branch_id: 'b1000000-0000-0000-0000-000000000001',
    branch_name: 'Little Lumley Branch',
    branch_slug: 'little-lumley',
    description: 'High-contrast KDS live ticket grid, item bumps, audio chime & audio toggle.',
  },
  {
    id: 'demo-manager-lumley',
    email: 'manager.lumley@chickentownsl.com',
    full_name: 'Ibrahim Bangura (Branch Manager)',
    role: 'BRANCH_MANAGER',
    branch_id: 'b1000000-0000-0000-0000-000000000002',
    branch_name: 'Big Lumley Branch',
    branch_slug: 'big-lumley',
    description: 'Branch daily operations, active accounting day controls, EOD Z-reports & reconciliation.',
  },
]

export interface StaffState {
  currentStaff: StaffUser | null
  activeAccountingDate: string // YYYY-MM-DD
  isLoading: boolean
  error: string | null

  loginAsDemo: (presetIdOrRole: string, overrideBranchId?: string) => void
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setCurrentStaff: (staff: StaffUser | null) => void
  setActiveAccountingDate: (date: string) => void
}

function getTodayAccountingDate(): string {
  return new Date().toISOString().split('T')[0]
}

export const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      currentStaff: DEMO_PRESETS[0], // Default Super Admin for ease of testing
      activeAccountingDate: getTodayAccountingDate(),
      isLoading: false,
      error: null,

      loginAsDemo: (presetIdOrRole: string, overrideBranchId?: string) => {
        // Try finding by ID first
        let preset = DEMO_PRESETS.find((p) => p.id === presetIdOrRole)

        // Try finding by role
        if (!preset) {
          preset = DEMO_PRESETS.find((p) => p.role === presetIdOrRole)
        }

        if (!preset) {
          // Default fallback
          preset = DEMO_PRESETS[0]
        }

        let branch_id = preset.branch_id
        let branch_name = preset.branch_name
        let branch_slug = preset.branch_slug

        if (overrideBranchId) {
          const branch =
            BRANCHES.find((b) => b.id === overrideBranchId) ||
            getBranchBySlug(overrideBranchId)
          if (branch) {
            branch_id = branch.id
            branch_name = branch.name
            branch_slug = branch.slug
          }
        }

        set({
          currentStaff: {
            id: preset.id,
            email: preset.email,
            full_name: preset.full_name,
            role: preset.role,
            branch_id,
            branch_name,
            branch_slug,
          },
          error: null,
        })
      },

      loginWithSupabase: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          if (data.user) {
            // Fetch staff profile
            const { data: profile } = await (supabase
              .from('staff_profiles') as any)
              .select('*, branches(name, slug)')
              .eq('id', data.user.id)
              .single()

            const profileData = profile as any
            const branchData = profileData?.branches as { name: string; slug: string } | undefined

            const staffUser: StaffUser = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: profileData?.full_name || 'Staff Member',
              role: (profileData?.role as StaffRole) || 'CASHIER',
              branch_id: profileData?.branch_id || null,
              branch_name: branchData?.name || (profileData?.branch_id ? 'Assigned Branch' : 'All Branches'),
              branch_slug: branchData?.slug || null,
            }

            set({ currentStaff: staffUser, isLoading: false, error: null })
            return { success: true }
          }

          set({ isLoading: false, error: 'User session not found' })
          return { success: false, error: 'User session not found' }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      logout: () => {
        try {
          const supabase = createClient()
          supabase.auth.signOut().catch(() => {})
        } catch {
          // Ignore
        }
        set({ currentStaff: null, error: null })
      },

      setCurrentStaff: (staff) => set({ currentStaff: staff }),
      setActiveAccountingDate: (date) => set({ activeAccountingDate: date }),
    }),
    {
      name: 'ct_staff_session',
      partialize: (state) => ({
        currentStaff: state.currentStaff,
        activeAccountingDate: state.activeAccountingDate,
      }),
    }
  )
)
