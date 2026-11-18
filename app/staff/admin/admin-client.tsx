'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  UtensilsCrossed,
  Users,
  BarChart3,
  QrCode,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Eye,
  Building2,
  Phone,
  Mail,
  Printer,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Truck,
  Store,
  Layers,
  ChevronRight,
  Download,
  Flame,
} from 'lucide-react'

// Auth & Store
import { useStaffStore, DEMO_PRESETS, type StaffUser } from '@/store/useStaffStore'
import { canAccessAdmin } from '@/lib/staff-auth'
import { createClient } from '@/lib/supabase/client'

// Data
import { BRANCHES, getBranches, type Branch } from '@/lib/data/branches'
import {
  getCategories,
  getMenuItems,
  type MenuItem,
  type Category,
  type ItemVariant,
  type ModifierGroup,
} from '@/lib/data/menu-data'
import { generateQRCodeSVG } from '@/lib/qrcode'
import { formatSLE } from '@/lib/utils'
import type { StaffRole } from '@/types'

type AdminTab = 'menu' | 'staff' | 'analytics' | 'qrcodes'

export default function AdminClient() {
  const { currentStaff, loginAsDemo } = useStaffStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('menu')

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 1: MENU MANAGEMENT STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>(() => getCategories())
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getMenuItems())
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [menuSearch, setMenuSearch] = useState('')

  // Category Add/Edit Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catOrder, setCatOrder] = useState<number>(0)

  // Item Add/Edit Modal
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemSlug, setItemSlug] = useState('')
  const [itemCategoryId, setItemCategoryId] = useState('')
  const [itemBasePrice, setItemBasePrice] = useState<string>('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemIsActive, setItemIsActive] = useState(true)

  // Variants & Modifiers Inspector Modal
  const [inspectingItem, setInspectingItem] = useState<MenuItem | null>(null)

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 2: STAFF MANAGEMENT STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<
    Array<{
      id: string
      full_name: string
      phone: string
      email: string
      role: StaffRole
      branch_id: string | null
      branch_name: string
      is_active: boolean
    }>
  >([
    {
      id: 'demo-admin',
      full_name: 'Aminata Kamara',
      phone: '+232 76 111 001',
      email: 'admin@chickentownsl.com',
      role: 'SUPER_ADMIN',
      branch_id: null,
      branch_name: 'All Branches (HQ)',
      is_active: true,
    },
    {
      id: 'demo-cashier-392',
      full_name: 'Mohamed Sesay',
      phone: '+232 76 111 002',
      email: 'cashier392@chickentownsl.com',
      role: 'CASHIER',
      branch_id: 'b1000000-0000-0000-0000-000000000007',
      branch_name: '392 Main Delivery Hub',
      is_active: true,
    },
    {
      id: 'demo-kitchen-lumley',
      full_name: 'Fatmata Turay',
      phone: '+232 76 111 003',
      email: 'kitchen.lumley@chickentownsl.com',
      role: 'KITCHEN',
      branch_id: 'b1000000-0000-0000-0000-000000000001',
      branch_name: 'Little Lumley Branch',
      is_active: true,
    },
    {
      id: 'demo-manager-lumley',
      full_name: 'Ibrahim Bangura',
      phone: '+232 76 111 004',
      email: 'manager.lumley@chickentownsl.com',
      role: 'BRANCH_MANAGER',
      branch_id: 'b1000000-0000-0000-0000-000000000002',
      branch_name: 'Big Lumley Branch',
      is_active: true,
    },
    {
      id: 'staff-5',
      full_name: 'Samuel Koroma',
      phone: '+232 78 222 105',
      email: 'samuel.wilkinson@chickentownsl.com',
      role: 'BRANCH_MANAGER',
      branch_id: 'b1000000-0000-0000-0000-000000000003',
      branch_name: 'Wilkinson Road Branch',
      is_active: true,
    },
    {
      id: 'staff-6',
      full_name: 'Zainab Jalloh',
      phone: '+232 79 333 106',
      email: 'zainab.jui@chickentownsl.com',
      role: 'CASHIER',
      branch_id: 'b1000000-0000-0000-0000-000000000006',
      branch_name: 'Jui Branch',
      is_active: true,
    },
  ])

  const [showStaffModal, setShowStaffModal] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
  const [staffFormName, setStaffFormName] = useState('')
  const [staffFormEmail, setStaffFormEmail] = useState('')
  const [staffFormPhone, setStaffFormPhone] = useState('')
  const [staffFormRole, setStaffFormRole] = useState<StaffRole>('CASHIER')
  const [staffFormBranchId, setStaffFormBranchId] = useState<string>('')

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 3: CONSOLIDATED SALES ANALYTICS MOCK DATA
  // ───────────────────────────────────────────────────────────────────────────
  const branchAnalytics = useMemo(() => {
    return [
      {
        branch: BRANCHES.find((b) => b.slug === '392')!,
        activeAccountingDate: new Date().toISOString().split('T')[0],
        todayOrders: 48,
        todaySales: 16450,
        lifetimeSales: 542000,
        deliveryShare: 100,
        dineInShare: 0,
        pickupShare: 0,
        status: 'Active Hub',
      },
      {
        branch: BRANCHES.find((b) => b.slug === 'little-lumley')!,
        activeAccountingDate: new Date().toISOString().split('T')[0],
        todayOrders: 32,
        todaySales: 8960,
        lifetimeSales: 284000,
        deliveryShare: 0,
        dineInShare: 65,
        pickupShare: 35,
        status: 'Retail Open',
      },
      {
        branch: BRANCHES.find((b) => b.slug === 'big-lumley')!,
        activeAccountingDate: new Date().toISOString().split('T')[0],
        todayOrders: 41,
        todaySales: 11200,
        lifetimeSales: 395000,
        deliveryShare: 0,
        dineInShare: 70,
        pickupShare: 30,
        status: 'Retail Open',
      },
      {
        branch: BRANCHES.find((b) => b.slug === 'wilkinson-road')!,
        activeAccountingDate: new Date().toISOString().split('T')[0],
        todayOrders: 27,
        todaySales: 7450,
        lifetimeSales: 241000,
        deliveryShare: 0,
        dineInShare: 55,
        pickupShare: 45,
        status: 'Retail Open',
      },
      {
        branch: BRANCHES.find((b) => b.slug === 'old-railway-line')!,
        activeAccountingDate: new Date().toISOString().split('T')[0],
        todayOrders: 22,
        todaySales: 5890,
        lifetimeSales: 189000,
        deliveryShare: 0,
        dineInShare: 50,
        pickupShare: 50,
        status: 'Retail Open',
      },
      {
        branch: BRANCHES.find((b) => b.slug === 'wilberforce-street')!,
        activeAccountingDate: new Date().toISOString().split('T')[0],
        todayOrders: 36,
        todaySales: 9800,
        lifetimeSales: 320000,
        deliveryShare: 0,
        dineInShare: 60,
        pickupShare: 40,
        status: 'Retail Open',
      },
      {
        branch: BRANCHES.find((b) => b.slug === 'jui')!,
        activeAccountingDate: new Date().toISOString().split('T')[0],
        todayOrders: 19,
        todaySales: 4720,
        lifetimeSales: 145000,
        deliveryShare: 0,
        dineInShare: 45,
        pickupShare: 55,
        status: 'Retail Open',
      },
    ]
  }, [])

  const totalTodaySales = useMemo(
    () => branchAnalytics.reduce((acc, b) => acc + b.todaySales, 0),
    [branchAnalytics]
  )
  const totalTodayOrders = useMemo(
    () => branchAnalytics.reduce((acc, b) => acc + b.todayOrders, 0),
    [branchAnalytics]
  )
  const totalLifetimeSales = useMemo(
    () => branchAnalytics.reduce((acc, b) => acc + b.lifetimeSales, 0),
    [branchAnalytics]
  )

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 4: TABLE QR CODE GENERATOR STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [selectedQrBranchSlug, setSelectedQrBranchSlug] = useState<string>('little-lumley')
  const [qrMode, setQrMode] = useState<'single' | 'batch'>('single')
  const [singleTableNum, setSingleTableNum] = useState<string>('20')
  const [batchStart, setBatchStart] = useState<number>(1)
  const [batchEnd, setBatchEnd] = useState<number>(10)
  const [appOrigin, setAppOrigin] = useState<string>('https://chickentownsl.com')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin)
    }
  }, [])

  const selectedQrBranch = useMemo(() => {
    return BRANCHES.find((b) => b.slug === selectedQrBranchSlug) || BRANCHES[0]
  }, [selectedQrBranchSlug])

  // Table numbers to render in preview/print
  const tablesToPrint = useMemo(() => {
    if (qrMode === 'single') {
      const num = singleTableNum.trim() || '1'
      return [num]
    } else {
      const start = Math.max(1, batchStart)
      const end = Math.max(start, Math.min(start + 49, batchEnd)) // limit batch to 50 cards
      const list: string[] = []
      for (let i = start; i <= end; i++) {
        list.push(i.toString())
      }
      return list
    }
  }, [qrMode, singleTableNum, batchStart, batchEnd])

  // ───────────────────────────────────────────────────────────────────────────
  // ACCESS CONTROL RESTRICTION
  // ───────────────────────────────────────────────────────────────────────────
  const hasAccess = canAccessAdmin(currentStaff?.role)

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Super Admin Access Required</h1>
        <p className="text-white/70 max-w-md text-sm mb-6">
          This portal is strictly restricted to Chicken Town SL Super Administrators. Your current role is{' '}
          <strong className="text-brand-gold uppercase">{currentStaff?.role || 'Guest'}</strong>.
        </p>
        <button
          onClick={() => loginAsDemo('demo-admin')}
          className="bg-brand-red hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-brand-red/30 cursor-pointer"
        >
          Switch to Demo Super Admin (Aminata Kamara)
        </button>
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY ACTIONS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAddCategory = () => {
    setEditingCategory(null)
    setCatName('')
    setCatSlug('')
    setCatOrder(categories.length + 1)
    setShowCategoryModal(true)
  }

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatSlug(cat.slug)
    setCatOrder(cat.display_order)
    setShowCategoryModal(true)
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim() || !catSlug.trim()) return

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: catName.trim(), slug: catSlug.trim(), display_order: Number(catOrder) }
            : c
        )
      )
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: catName.trim(),
        slug: catSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        display_order: Number(catOrder) || categories.length + 1,
        is_active: true,
      }
      setCategories((prev) => [...prev, newCat])
    }
    setShowCategoryModal(false)
  }

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Delete this category? Items in this category will need reassignment.')) {
      setCategories((prev) => prev.filter((c) => c.id !== catId))
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MENU ITEM ACTIONS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAddItem = () => {
    setEditingItem(null)
    setItemName('')
    setItemSlug('')
    setItemCategoryId(categories[0]?.id || '')
    setItemBasePrice('')
    setItemDescription('')
    setItemIsActive(true)
    setShowItemModal(true)
  }

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemSlug(item.slug)
    setItemCategoryId(item.categoryId)
    setItemBasePrice(item.base_price !== null ? item.base_price.toString() : '')
    setItemDescription(item.description || '')
    setItemIsActive(item.is_active)
    setShowItemModal(true)
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim() || !itemSlug.trim() || !itemCategoryId) return

    const parsedPrice = itemBasePrice.trim() !== '' ? parseFloat(itemBasePrice) : null

    if (editingItem) {
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                name: itemName.trim(),
                slug: itemSlug.trim(),
                categoryId: itemCategoryId,
                base_price: parsedPrice,
                description: itemDescription.trim() || undefined,
                is_active: itemIsActive,
              }
            : i
        )
      )
    } else {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        name: itemName.trim(),
        slug: itemSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        categoryId: itemCategoryId,
        base_price: parsedPrice,
        description: itemDescription.trim() || undefined,
        is_active: itemIsActive,
        display_order: menuItems.length + 1,
      }
      setMenuItems((prev) => [newItem, ...prev])
    }
    setShowItemModal(false)
  }

  const handleToggleItemActive = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_active: !i.is_active } : i))
    )
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId))
    }
  }

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    let list = menuItems
    if (selectedCategoryId !== 'all') {
      list = list.filter((i) => i.categoryId === selectedCategoryId)
    }
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase().trim()
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.slug.toLowerCase().includes(q)
      )
    }
    return list
  }, [menuItems, selectedCategoryId, menuSearch])

  // ───────────────────────────────────────────────────────────────────────────
  // STAFF ACTIONS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAddStaff = () => {
    setEditingStaffId(null)
    setStaffFormName('')
    setStaffFormEmail('')
    setStaffFormPhone('+232 ')
    setStaffFormRole('CASHIER')
    setStaffFormBranchId(BRANCHES[0].id)
    setShowStaffModal(true)
  }

  const handleOpenEditStaff = (staff: (typeof staffList)[0]) => {
    setEditingStaffId(staff.id)
    setStaffFormName(staff.full_name)
    setStaffFormEmail(staff.email)
    setStaffFormPhone(staff.phone)
    setStaffFormRole(staff.role)
    setStaffFormBranchId(staff.branch_id || '')
    setShowStaffModal(true)
  }

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffFormName.trim() || !staffFormEmail.trim()) return

    const branch = BRANCHES.find((b) => b.id === staffFormBranchId)
    const branchName = staffFormRole === 'SUPER_ADMIN' ? 'All Branches (HQ)' : branch?.name || 'Unassigned'

    if (editingStaffId) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaffId
            ? {
                ...s,
                full_name: staffFormName.trim(),
                email: staffFormEmail.trim(),
                phone: staffFormPhone.trim(),
                role: staffFormRole,
                branch_id: staffFormRole === 'SUPER_ADMIN' ? null : staffFormBranchId || null,
                branch_name: branchName,
              }
            : s
        )
      )
    } else {
      setStaffList((prev) => [
        {
          id: `staff-${Date.now()}`,
          full_name: staffFormName.trim(),
          email: staffFormEmail.trim(),
          phone: staffFormPhone.trim(),
          role: staffFormRole,
          branch_id: staffFormRole === 'SUPER_ADMIN' ? null : staffFormBranchId || null,
          branch_name: branchName,
          is_active: true,
        },
        ...prev,
      ])
    }
    setShowStaffModal(false)
  }

  const handleToggleStaffActive = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, is_active: !s.is_active } : s))
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRINT ACTION FOR QR STAND CARDS
  // ───────────────────────────────────────────────────────────────────────────
  const handlePrintCards = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ── Top Bar with Title & Tab Navigation ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Super Admin Control
            </span>
            <span className="text-white/40 text-xs">• HQ Freetown</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Global Operations &amp; Administration</span>
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menu &amp; Modifiers</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Users</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Multi-Branch Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcodes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'qrcodes'
                ? 'bg-brand-red text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Table QR Cards</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: MENU & MODIFIERS MANAGEMENT                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Categories Manager Bar */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-gold" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Menu Categories ({categories.length})
                </h2>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Category pills list */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategoryId === 'all'
                    ? 'bg-brand-gold text-charcoal shadow-sm'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                All Categories ({menuItems.length})
              </button>

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-brand-gold text-charcoal'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <button
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="cursor-pointer"
                  >
                    {cat.name} ({menuItems.filter((i) => i.categoryId === cat.id).length})
                  </button>
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1 hover:text-brand-red rounded ml-1 text-black/60 hover:text-black cursor-pointer"
                    title="Edit category"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Add Item Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search items by name or slug…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <button
              onClick={handleOpenAddItem}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-brand-red/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Menu Item</span>
            </button>
          </div>

          {/* Menu Items Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-white/5 text-white/60 font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Item Name &amp; Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Pricing</th>
                    <th className="py-3 px-4">Variants &amp; Modifiers</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMenuItems.map((item) => {
                    const cat = categories.find((c) => c.id === item.categoryId)
                    const variantCount = item.variants?.length || 0
                    const modifierGroupCount = item.modifier_groups?.length || 0

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{item.name}</div>
                          <div className="text-[11px] text-white/50 line-clamp-1">
                            {item.description || item.slug}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-white/80">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[11px]">
                            {cat?.name || item.categoryId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-brand-gold">
                          {item.base_price !== null && item.base_price !== undefined ? (
                            `Le ${item.base_price}`
                          ) : (
                            <span className="text-white/60 text-[11px] font-normal">
                              Uses Variants ({variantCount})
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setInspectingItem(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-brand-gold/20 hover:text-brand-gold text-white/80 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>
                              {variantCount} Var • {modifierGroupCount} Mod Groups
                            </span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleItemActive(item.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              item.is_active
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: STAFF USER MANAGEMENT                                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Staff Accounts &amp; Permissions</h2>
              <p className="text-xs text-white/60">
                Manage branch assignments and role access for Super Admin, Branch Managers, Cashiers, and Kitchen chefs.
              </p>
            </div>

            <button
              onClick={handleOpenAddStaff}
              className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-brand-red/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Invite / Add Staff User</span>
            </button>
          </div>

          {/* Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((staff) => {
              const roleBadgeColor =
                staff.role === 'SUPER_ADMIN'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : staff.role === 'BRANCH_MANAGER'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : staff.role === 'CASHIER'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'

              return (
                <div
                  key={staff.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-white text-sm">{staff.full_name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[180px]">{staff.email}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${roleBadgeColor}`}
                      >
                        {staff.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs text-white/70">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span className="font-semibold text-white truncate">
                          {staff.branch_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span>{staff.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleStaffActive(staff.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                        staff.is_active
                          ? 'text-emerald-400 hover:underline'
                          : 'text-red-400 hover:underline'
                      }`}
                    >
                      {staff.is_active ? '● Active' : '○ Suspended'}
                    </button>

                    <button
                      onClick={() => handleOpenEditStaff(staff)}
                      className="inline-flex items-center gap-1 font-semibold text-brand-gold hover:underline cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Role</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: MULTI-BRANCH CONSOLIDATED SALES ANALYTICS                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-red/20 to-white/5 border border-brand-red/40">
              <div className="flex items-center justify-between text-brand-gold text-xs font-bold uppercase tracking-wider mb-2">
                <span>Today&apos;s Gross Sales</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-white">
                Le {totalTodaySales.toLocaleString('en-SL')}
              </div>
              <div className="text-xs text-white/60 mt-1">Across all 7 Freetown locations</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-brand-gold text-xs font-bold uppercase tracking-wider mb-2">
                <span>Today&apos;s Total Orders</span>
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-white">{totalTodayOrders}</div>
              <div className="text-xs text-white/60 mt-1">Delivery + Pickup + QR Table</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-brand-gold text-xs font-bold uppercase tracking-wider mb-2">
                <span>Consolidated Lifetime</span>
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-white">
                Le {totalLifetimeSales.toLocaleString('en-SL')}
              </div>
              <div className="text-xs text-white/60 mt-1">Cumulative sales recorded</div>
            </div>
          </div>

          {/* Delivery Hub Note */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <Truck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-bold block mb-0.5">
                Centralized 392 Dispatch Architecture Active
              </strong>
              100% of delivery orders across Freetown are routed exclusively through the 392 Delivery Hub,
              ensuring hot, consistent preparation and specialized dispatch rider coordination. Retail branches
              fulfill 100% Dine-In and Pickup orders.
            </div>
          </div>

          {/* Branch-by-Branch Performance Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white text-sm">Branch Performance Breakdown</h3>
              <span className="text-xs text-white/60">
                Operating Hours: 10:00 AM – 02:00 AM
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-white/5 text-white/60 font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Role / Type</th>
                    <th className="py-3 px-4">Active Date</th>
                    <th className="py-3 px-4 text-center">Orders Today</th>
                    <th className="py-3 px-4">Sales Today</th>
                    <th className="py-3 px-4">Volume Mix</th>
                    <th className="py-3 px-4 text-right">Lifetime Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {branchAnalytics.map((item) => (
                    <tr key={item.branch.slug} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{item.branch.name}</div>
                        <div className="text-[11px] text-white/50">{item.branch.address}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {item.branch.is_delivery_hub ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-red text-white">
                            Central Hub
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/80">
                            Retail Branch
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-white/80 font-mono text-[11px]">
                        {item.activeAccountingDate}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-white">
                        {item.todayOrders}
                      </td>

                      <td className="py-3.5 px-4 font-black text-brand-gold text-sm">
                        Le {item.todaySales.toLocaleString('en-SL')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5">
                          {item.deliveryShare > 0 && (
                            <div className="text-brand-red font-semibold">
                              {item.deliveryShare}% Delivery
                            </div>
                          )}
                          {item.dineInShare > 0 && (
                            <div className="text-white/70">{item.dineInShare}% Dine-In</div>
                          )}
                          {item.pickupShare > 0 && (
                            <div className="text-white/70">{item.pickupShare}% Pickup</div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-white/80 font-mono">
                        Le {item.lifetimeSales.toLocaleString('en-SL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: TABLE QR CODE GENERATOR & PRINTABLE CARDS                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'qrcodes' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-brand-gold" />
                  <span>Dine-In Table QR Generator &amp; Stand Card Maker</span>
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Generates dedicated QR codes that automatically lock guests into the correct branch &amp; table number.
                </p>
              </div>

              <button
                onClick={handlePrintCards}
                className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-yellow-400 text-charcoal font-black px-5 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Print Stand Cards ({tablesToPrint.length})</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-white/10 text-xs">
              {/* Branch Selector */}
              <div>
                <label className="block text-white/70 font-semibold mb-1">Select Branch</label>
                <select
                  value={selectedQrBranchSlug}
                  onChange={(e) => setSelectedQrBranchSlug(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.slug} value={b.slug} className="bg-charcoal text-white">
                      {b.name} {b.is_delivery_hub ? '(Delivery Hub)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-white/70 font-semibold mb-1">Generation Mode</label>
                <div className="grid grid-cols-2 gap-1 bg-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setQrMode('single')}
                    className={`py-1.5 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                      qrMode === 'single' ? 'bg-brand-red text-white' : 'text-white/70'
                    }`}
                  >
                    Single Table
                  </button>
                  <button
                    onClick={() => setQrMode('batch')}
                    className={`py-1.5 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                      qrMode === 'batch' ? 'bg-brand-red text-white' : 'text-white/70'
                    }`}
                  >
                    Batch (1..N)
                  </button>
                </div>
              </div>

              {/* Table Number inputs */}
              {qrMode === 'single' ? (
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Table Number</label>
                  <input
                    type="text"
                    value={singleTableNum}
                    onChange={(e) => setSingleTableNum(e.target.value)}
                    placeholder="e.g. 20, 15A"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-white/70 font-semibold mb-1">From Table #</label>
                    <input
                      type="number"
                      min={1}
                      value={batchStart}
                      onChange={(e) => setBatchStart(parseInt(e.target.value) || 1)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-white/70 font-semibold mb-1">To Table #</label>
                    <input
                      type="number"
                      min={batchStart}
                      max={batchStart + 49}
                      value={batchEnd}
                      onChange={(e) => setBatchEnd(parseInt(e.target.value) || batchStart)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>
              )}

              {/* Target URL Preview */}
              <div>
                <label className="block text-white/70 font-semibold mb-1">Target Format</label>
                <div className="truncate bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-brand-gold">
                  {`/order?branch=${selectedQrBranchSlug}&table=[X]`}
                </div>
              </div>
            </div>
          </div>

          {/* Printable Cards Preview Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">
                Printable Stand Cards Preview ({tablesToPrint.length}{' '}
                {tablesToPrint.length === 1 ? 'card' : 'cards'})
              </h3>
              <span className="text-xs text-white/50">
                Click &quot;Print Stand Cards&quot; to print physical display cards
              </span>
            </div>

            {/* Stand Cards Container with print media query styles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:m-0 print:p-0">
              {tablesToPrint.map((tblNum) => {
                const targetUrl = `${appOrigin}/order?branch=${selectedQrBranch.slug}&table=${tblNum}`
                const qrSvg = generateQRCodeSVG(targetUrl, 160)

                return (
                  <div
                    key={tblNum}
                    className="bg-white text-charcoal rounded-3xl p-6 shadow-2xl border-4 border-brand-red flex flex-col items-center text-center relative overflow-hidden print:shadow-none print:break-inside-avoid print:my-4"
                  >
                    {/* Top Header Badge */}
                    <div className="w-full bg-brand-red text-white py-2 px-4 -mt-6 -mx-6 mb-4 flex items-center justify-center gap-2">
                      <Flame className="w-4 h-4 text-brand-gold fill-brand-gold" />
                      <span className="font-black text-sm tracking-wider uppercase">
                        CHICKEN TOWN SL
                      </span>
                    </div>

                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-brand-red mb-1">
                      SWIT U MOT SWIT U LYF
                    </div>

                    <div className="text-xs font-semibold text-charcoal/70 mb-3">
                      {selectedQrBranch.name}
                    </div>

                    {/* Giant Table Badge */}
                    <div className="bg-brand-gold text-charcoal px-6 py-2 rounded-2xl font-black text-3xl tracking-tight shadow-md border-2 border-charcoal/10 mb-4">
                      TABLE {tblNum}
                    </div>

                    {/* QR Code */}
                    <div
                      className="p-3 bg-white rounded-2xl shadow-inner border border-charcoal/10 mb-4"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />

                    {/* Guest Instructions */}
                    <div className="space-y-1 text-xs text-charcoal/80">
                      <p className="font-bold text-charcoal text-sm">
                        Scan to View Menu &amp; Order
                      </p>
                      <p className="text-[11px] text-charcoal/60 leading-tight">
                        Point your phone camera here • No app download needed
                        <br />
                        Your food will be delivered directly to Table {tblNum}!
                      </p>
                    </div>

                    {/* Bottom URL line */}
                    <div className="mt-4 pt-3 border-t border-charcoal/10 w-full text-[10px] font-mono text-charcoal/50 truncate">
                      {targetUrl}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: ADD / EDIT CATEGORY                                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value)
                    if (!editingCategory) {
                      setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }
                  }}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Display Order</label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {editingCategory ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteCategory(editingCategory.id)
                      setShowCategoryModal(false)
                    }}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    Delete Category
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-red hover:bg-red-700 text-white font-bold cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: ADD / EDIT MENU ITEM                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value)
                    if (!editingItem) {
                      setItemSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }
                  }}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={itemSlug}
                    onChange={(e) => setItemSlug(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Category</label>
                  <select
                    value={itemCategoryId}
                    onChange={(e) => setItemCategoryId(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-charcoal text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Base Price (Le) — Leave empty if item uses variants
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={itemBasePrice}
                  onChange={(e) => setItemBasePrice(e.target.value)}
                  placeholder="e.g. 85 (or empty for variant items)"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Appetizing description for guests…"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="itemActiveCheck"
                  checked={itemIsActive}
                  onChange={(e) => setItemIsActive(e.target.checked)}
                  className="rounded border-white/20 text-brand-red focus:ring-brand-red"
                />
                <label htmlFor="itemActiveCheck" className="text-white font-medium cursor-pointer">
                  Item is Active on Storefront
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-red hover:bg-red-700 text-white font-bold cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: VARIANTS & MODIFIERS INSPECTOR                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 w-full max-w-xl shadow-2xl text-white max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Variants &amp; Modifiers Inspector</span>
                </h3>
                <p className="text-xs text-brand-gold font-semibold">{inspectingItem.name}</p>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Variants Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Variants ({inspectingItem.variants?.length || 0})</span>
              </h4>
              {inspectingItem.variants && inspectingItem.variants.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {inspectingItem.variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <span className="font-semibold text-white">{v.name}</span>
                      <span className="font-bold text-brand-gold">Le {v.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/50 italic">
                  No variants defined (uses base price: Le {inspectingItem.base_price || 0})
                </p>
              )}
            </div>

            {/* Modifier Groups Section */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Modifier Groups ({inspectingItem.modifier_groups?.length || 0})
              </h4>
              {inspectingItem.modifier_groups && inspectingItem.modifier_groups.length > 0 ? (
                <div className="space-y-3">
                  {inspectingItem.modifier_groups.map((group) => (
                    <div
                      key={group.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{group.name}</span>
                        <span className="text-[10px] text-white/60">
                          Min: {group.min_selections} • Max: {group.max_selections}{' '}
                          {group.required ? '(Required)' : '(Optional)'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.options.map((opt) => (
                          <span
                            key={opt.id}
                            className="px-2 py-1 rounded bg-white/10 text-[11px] text-white/80"
                          >
                            {opt.name}{' '}
                            {opt.price_delta > 0 && (
                              <strong className="text-brand-gold">+Le {opt.price_delta}</strong>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/50 italic">No modifier groups attached to this item.</p>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 4: ADD / EDIT STAFF PROFILE                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingStaffId ? 'Edit Staff Profile' : 'Invite / Add Staff Profile'}
            </h3>
            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffFormName}
                  onChange={(e) => setStaffFormName(e.target.value)}
                  placeholder="e.g. John Sesay"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffFormEmail}
                  onChange={(e) => setStaffFormEmail(e.target.value)}
                  placeholder="e.g. john@chickentownsl.com"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={staffFormPhone}
                  onChange={(e) => setStaffFormPhone(e.target.value)}
                  placeholder="+232 76 123 456"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Role</label>
                  <select
                    value={staffFormRole}
                    onChange={(e) => setStaffFormRole(e.target.value as StaffRole)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="SUPER_ADMIN" className="bg-charcoal text-white">
                      SUPER_ADMIN
                    </option>
                    <option value="BRANCH_MANAGER" className="bg-charcoal text-white">
                      BRANCH_MANAGER
                    </option>
                    <option value="CASHIER" className="bg-charcoal text-white">
                      CASHIER
                    </option>
                    <option value="KITCHEN" className="bg-charcoal text-white">
                      KITCHEN
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Branch</label>
                  <select
                    disabled={staffFormRole === 'SUPER_ADMIN'}
                    value={staffFormBranchId}
                    onChange={(e) => setStaffFormBranchId(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-gold disabled:opacity-50"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id} className="bg-charcoal text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-red hover:bg-red-700 text-white font-bold cursor-pointer"
                >
                  Save Staff Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
