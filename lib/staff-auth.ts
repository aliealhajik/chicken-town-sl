import { StaffRole } from '@/types'
import { StaffUser, useStaffStore, DEMO_PRESETS } from '@/store/useStaffStore'

export { useStaffStore, DEMO_PRESETS }
export type { StaffUser }

/**
 * Staff permission helpers
 */
export function canAccessKds(role?: StaffRole | null): boolean {
  if (!role) return false
  return ['KITCHEN', 'BRANCH_MANAGER', 'SUPER_ADMIN'].includes(role)
}

export function canAccessCashier(role?: StaffRole | null): boolean {
  if (!role) return false
  return ['CASHIER', 'BRANCH_MANAGER', 'SUPER_ADMIN'].includes(role)
}

export function canAccessManager(role?: StaffRole | null): boolean {
  if (!role) return false
  return ['BRANCH_MANAGER', 'SUPER_ADMIN'].includes(role)
}

export function canAccessAdmin(role?: StaffRole | null): boolean {
  if (!role) return false
  return role === 'SUPER_ADMIN'
}

/**
 * Returns role-specific color styling for UI badges
 */
export function getRoleBadgeConfig(role?: StaffRole | null): {
  label: string
  bgClass: string
  textClass: string
  borderClass: string
} {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        label: 'Super Admin',
        bgClass: 'bg-purple-950/80',
        textClass: 'text-purple-300 font-bold',
        borderClass: 'border-purple-600/50',
      }
    case 'BRANCH_MANAGER':
      return {
        label: 'Branch Manager',
        bgClass: 'bg-blue-950/80',
        textClass: 'text-blue-300 font-bold',
        borderClass: 'border-blue-600/50',
      }
    case 'CASHIER':
      return {
        label: 'Cashier / Dispatch',
        bgClass: 'bg-emerald-950/80',
        textClass: 'text-emerald-300 font-bold',
        borderClass: 'border-emerald-600/50',
      }
    case 'KITCHEN':
      return {
        label: 'Kitchen Display',
        bgClass: 'bg-amber-950/80',
        textClass: 'text-amber-300 font-bold',
        borderClass: 'border-amber-600/50',
      }
    default:
      return {
        label: 'Staff',
        bgClass: 'bg-gray-800',
        textClass: 'text-gray-300',
        borderClass: 'border-gray-700',
      }
  }
}
