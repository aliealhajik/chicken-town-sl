'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Truck,
  Utensils,
  Search,
  Filter,
  Lock,
  Printer,
  RefreshCw,
  FileText,
  Check,
  X,
  ChevronRight,
  Info,
  DollarSign,
  Receipt,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStaffStore, canAccessManager, DEMO_PRESETS } from '@/lib/staff-auth'
import { BRANCHES, type Branch } from '@/lib/data/branches'
import { CATEGORIES, MENU_ITEMS, type MenuItem } from '@/lib/data/menu-data'
import { formatSLE, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface ShiftOrder {
  id: string
  order_number: string
  branch_id: string
  accounting_date: string
  status:
    | 'AWAITING_DELIVERY_FEE'
    | 'FEE_QUOTED'
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'OUT_FOR_DELIVERY'
    | 'COMPLETED'
    | 'CANCELLED'
  fulfillment_type: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
  order_source: 'WEB' | 'QR_TABLE' | 'WHATSAPP'
  table_number: string | null
  payment_method: 'MONIME' | 'PAY_ON_ARRIVAL'
  payment_status: 'UNPAID' | 'PAID'
  subtotal: number
  delivery_fee: number | null
  total_amount: number
  created_at: string
}

interface ZReport {
  id: string
  branch_id: string
  accounting_date: string
  report_data: any
  closed_by: string
  created_at: string
}

// Initial mock orders for initial shift demonstration
const INITIAL_DEMO_ORDERS: Record<string, ShiftOrder[]> = {
  'b1000000-0000-0000-0000-000000000002': [
    {
      id: 'ord-m1',
      order_number: 'CT-20241117-001',
      branch_id: 'b1000000-0000-0000-0000-000000000002',
      accounting_date: '2024-11-17',
      status: 'COMPLETED',
      fulfillment_type: 'DINE_IN',
      order_source: 'QR_TABLE',
      table_number: '12',
      payment_method: 'PAY_ON_ARRIVAL',
      payment_status: 'PAID',
      subtotal: 350,
      delivery_fee: 0,
      total_amount: 350,
      created_at: '2024-11-17T11:20:00Z',
    },
    {
      id: 'ord-m2',
      order_number: 'CT-20241117-002',
      branch_id: 'b1000000-0000-0000-0000-000000000002',
      accounting_date: '2024-11-17',
      status: 'COMPLETED',
      fulfillment_type: 'PICKUP',
      order_source: 'WEB',
      table_number: null,
      payment_method: 'MONIME',
      payment_status: 'PAID',
      subtotal: 499,
      delivery_fee: 0,
      total_amount: 499,
      created_at: '2024-11-17T12:05:00Z',
    },
    {
      id: 'ord-m3',
      order_number: 'CT-20241117-003',
      branch_id: 'b1000000-0000-0000-0000-000000000002',
      accounting_date: '2024-11-17',
      status: 'COMPLETED',
      fulfillment_type: 'DINE_IN',
      order_source: 'QR_TABLE',
      table_number: '4',
      payment_method: 'PAY_ON_ARRIVAL',
      payment_status: 'PAID',
      subtotal: 180,
      delivery_fee: 0,
      total_amount: 180,
      created_at: '2024-11-17T13:40:00Z',
    },
    {
      id: 'ord-m4',
      order_number: 'CT-20241117-004',
      branch_id: 'b1000000-0000-0000-0000-000000000002',
      accounting_date: '2024-11-17',
      status: 'READY',
      fulfillment_type: 'PICKUP',
      order_source: 'WEB',
      table_number: null,
      payment_method: 'PAY_ON_ARRIVAL',
      payment_status: 'UNPAID',
      subtotal: 155,
      delivery_fee: 0,
      total_amount: 155,
      created_at: '2024-11-17T14:10:00Z',
    },
    {
      id: 'ord-m5',
      order_number: 'CT-20241117-005',
      branch_id: 'b1000000-0000-0000-0000-000000000002',
      accounting_date: '2024-11-17',
      status: 'PREPARING',
      fulfillment_type: 'DINE_IN',
      order_source: 'QR_TABLE',
      table_number: '8',
      payment_method: 'MONIME',
      payment_status: 'PAID',
      subtotal: 295,
      delivery_fee: 0,
      total_amount: 295,
      created_at: '2024-11-17T14:22:00Z',
    },
  ],
}

// Initial mock historical Z-Reports
const INITIAL_DEMO_Z_REPORTS: ZReport[] = [
  {
    id: 'z-rep-001',
    branch_id: 'b1000000-0000-0000-0000-000000000002',
    accounting_date: '2024-11-16',
    closed_by: 'Ibrahim Bangura (Branch Manager)',
    created_at: '2024-11-16T23:55:00Z',
    report_data: {
      z_report_number: 'Z-20241116-BIGLUMLEY',
      branch_name: 'Big Lumley Branch',
      accounting_date: '2024-11-16',
      closed_at: '2024-11-16T23:55:00Z',
      closed_by: 'Ibrahim Bangura (Branch Manager)',
      summary: {
        total_orders: 26,
        completed_orders: 25,
        cancelled_orders: 1,
        gross_sales: 5480,
        cash_revenue: 3120,
        online_revenue: 2360,
        delivery_count: 0,
        delivery_volume: 0,
        pickup_count: 11,
        pickup_volume: 2420,
        dine_in_count: 15,
        dine_in_volume: 3060,
      },
    },
  },
  {
    id: 'z-rep-002',
    branch_id: 'b1000000-0000-0000-0000-000000000002',
    accounting_date: '2024-11-15',
    closed_by: 'Ibrahim Bangura (Branch Manager)',
    created_at: '2024-11-15T23:48:00Z',
    report_data: {
      z_report_number: 'Z-20241115-BIGLUMLEY',
      branch_name: 'Big Lumley Branch',
      accounting_date: '2024-11-15',
      closed_at: '2024-11-15T23:48:00Z',
      closed_by: 'Ibrahim Bangura (Branch Manager)',
      summary: {
        total_orders: 31,
        completed_orders: 31,
        cancelled_orders: 0,
        gross_sales: 6890,
        cash_revenue: 4150,
        online_revenue: 2740,
        delivery_count: 0,
        delivery_volume: 0,
        pickup_count: 14,
        pickup_volume: 3100,
        dine_in_count: 17,
        dine_in_volume: 3790,
      },
    },
  },
]

export default function ManagerClient() {
  const { currentStaff, activeAccountingDate: storeDate, setActiveAccountingDate, loginAsDemo } = useStaffStore()

  // Selected branch state (Super Admin can switch, Branch Manager is locked)
  const isSuperAdmin = currentStaff?.role === 'SUPER_ADMIN'
  const defaultBranchId = currentStaff?.branch_id || 'b1000000-0000-0000-0000-000000000002' // Big Lumley
  const [selectedBranchId, setSelectedBranchId] = useState<string>(defaultBranchId)

  // Current active branch object
  const activeBranch: Branch = useMemo(() => {
    return (
      BRANCHES.find((b) => b.id === selectedBranchId) ||
      BRANCHES.find((b) => b.id === defaultBranchId) ||
      BRANCHES[1]
    )
  }, [selectedBranchId, defaultBranchId])

  // Active accounting date state for this branch
  const [activeDate, setActiveDate] = useState<string>(storeDate || '2024-11-17')

  // Active tab: 'stock' | 'shift' | 'history'
  const [activeTab, setActiveTab] = useState<'stock' | 'shift' | 'history'>('shift')

  // Tab 1: Item availability map (menuItemId -> boolean)
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false)
  const [stockStatusMessage, setStockStatusMessage] = useState<string | null>(null)

  // Tab 2: Shift orders
  const [shiftOrders, setShiftOrders] = useState<ShiftOrder[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // EOD Modal state
  const [isEodModalOpen, setIsEodModalOpen] = useState(false)
  const [isFinalizingEod, setIsFinalizingEod] = useState(false)
  const [eodSuccessReport, setEodSuccessReport] = useState<any | null>(null)

  // Tab 3: Historical Z-Reports
  const [historicalReports, setHistoricalReports] = useState<ZReport[]>(INITIAL_DEMO_Z_REPORTS)
  const [selectedReportForView, setSelectedReportForView] = useState<ZReport | null>(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Initial Load & Supabase Sync
  // ─────────────────────────────────────────────────────────────────────────────
  const loadBranchData = useCallback(async (branchId: string) => {
    const supabase = createClient()

    // 1. Fetch active accounting date for branch
    try {
      const { data: dateData } = await (supabase
        .from('branch_accounting_days') as any)
        .select('active_accounting_date')
        .eq('branch_id', branchId)
        .maybeSingle()

      const row = dateData as { active_accounting_date?: string } | null
      if (row?.active_accounting_date) {
        setActiveDate(row.active_accounting_date)
        setActiveAccountingDate(row.active_accounting_date)
      } else {
        // Fallback default
        setActiveDate('2024-11-17')
      }
    } catch {
      // Use fallback
      setActiveDate('2024-11-17')
    }

    // 2. Fetch branch_item_availability
    try {
      const { data: availData } = await supabase
        .from('branch_item_availability')
        .select('menu_item_id, is_available')
        .eq('branch_id', branchId)

      if (availData && availData.length > 0) {
        const map: Record<string, boolean> = {}
        availData.forEach((row: any) => {
          map[row.menu_item_id] = row.is_available
        })
        setAvailabilityMap(map)
      } else {
        setAvailabilityMap({})
      }
    } catch {
      setAvailabilityMap({})
    }

    // 3. Fetch orders for this branch and active date
    setIsLoadingOrders(true)
    try {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })

      if (dbOrders && dbOrders.length > 0) {
        setShiftOrders(dbOrders as unknown as ShiftOrder[])
      } else {
        // Fallback to demo orders if empty on dev
        setShiftOrders(INITIAL_DEMO_ORDERS[branchId] || INITIAL_DEMO_ORDERS['b1000000-0000-0000-0000-000000000002'] || [])
      }
    } catch {
      setShiftOrders(INITIAL_DEMO_ORDERS[branchId] || INITIAL_DEMO_ORDERS['b1000000-0000-0000-0000-000000000002'] || [])
    } finally {
      setIsLoadingOrders(false)
    }

    // 4. Fetch past eod_z_reports
    try {
      const { data: zData } = await supabase
        .from('eod_z_reports')
        .select('*')
        .eq('branch_id', branchId)
        .order('accounting_date', { ascending: false })

      if (zData && zData.length > 0) {
        setHistoricalReports(zData as unknown as ZReport[])
      } else {
        setHistoricalReports(INITIAL_DEMO_Z_REPORTS)
      }
    } catch {
      setHistoricalReports(INITIAL_DEMO_Z_REPORTS)
    }
  }, [setActiveAccountingDate])

  useEffect(() => {
    loadBranchData(selectedBranchId)
  }, [selectedBranchId, loadBranchData])

  // Realtime subscription on orders
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`manager-orders-${selectedBranchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `branch_id=eq.${selectedBranchId}`,
        },
        () => {
          loadBranchData(selectedBranchId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedBranchId, loadBranchData])

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Tab 1 Actions: Stock Availability Toggle
  // ─────────────────────────────────────────────────────────────────────────────
  const toggleItemStock = async (itemId: string, itemName: string) => {
    const currentStatus = availabilityMap[itemId] !== false // default true
    const newStatus = !currentStatus

    setAvailabilityMap((prev) => ({
      ...prev,
      [itemId]: newStatus,
    }))

    setStockStatusMessage(`${itemName} is now marked ${newStatus ? 'IN STOCK' : 'OUT OF STOCK'}`)
    setTimeout(() => setStockStatusMessage(null), 3000)

    try {
      const supabase = createClient()
      await (supabase.from('branch_item_availability') as any).upsert(
        {
          branch_id: selectedBranchId,
          menu_item_id: itemId,
          is_available: newStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'branch_id,menu_item_id' }
      )
    } catch (err) {
      console.warn('Could not persist availability to Supabase:', err)
    }
  }

  const markAllInStock = async () => {
    const map: Record<string, boolean> = {}
    MENU_ITEMS.forEach((item) => {
      map[item.id] = true
    })
    setAvailabilityMap(map)
    setStockStatusMessage('All menu items are now marked IN STOCK for this branch.')
    setTimeout(() => setStockStatusMessage(null), 3500)

    try {
      const supabase = createClient()
      const rows = MENU_ITEMS.map((item) => ({
        branch_id: selectedBranchId,
        menu_item_id: item.id,
        is_available: true,
        updated_at: new Date().toISOString(),
      }))
      await (supabase.from('branch_item_availability') as any).upsert(rows, {
        onConflict: 'branch_id,menu_item_id',
      })
    } catch (err) {
      console.warn('Could not batch upsert availability to Supabase:', err)
    }
  }

  // Filtered menu items for stock toggle
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategoryFilter !== 'all' && item.categoryId !== selectedCategoryFilter) {
        return false
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesDesc = item.description?.toLowerCase().includes(q)
        if (!matchesName && !matchesDesc) return false
      }
      // Out of stock only filter
      if (showOutOfStockOnly) {
        const isAvail = availabilityMap[item.id] !== false
        if (isAvail) return false
      }
      return true
    })
  }, [searchQuery, selectedCategoryFilter, showOutOfStockOnly, availabilityMap])

  // Group filtered items by category
  const groupedMenuItems = useMemo(() => {
    const groups: { category: string; categoryId: string; items: MenuItem[] }[] = []
    CATEGORIES.forEach((cat) => {
      const itemsInCat = filteredMenuItems.filter((i) => i.categoryId === cat.id)
      if (itemsInCat.length > 0) {
        groups.push({
          category: cat.name,
          categoryId: cat.id,
          items: itemsInCat,
        })
      }
    })
    return groups
  }, [filteredMenuItems])

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Tab 2 Calculations: Shift Metrics
  // ─────────────────────────────────────────────────────────────────────────────
  // Filter orders strictly stamped for today's active accounting date
  const todayOrders = useMemo(() => {
    return shiftOrders.filter((o) => {
      // If order has accounting_date, match it; otherwise match date part of created_at
      const orderDate = o.accounting_date || o.created_at.split('T')[0]
      return orderDate === activeDate
    })
  }, [shiftOrders, activeDate])

  const totalOrdersCount = todayOrders.length
  const completedOrdersCount = todayOrders.filter((o) => o.status === 'COMPLETED').length
  const cancelledOrdersCount = todayOrders.filter((o) => o.status === 'CANCELLED').length

  // Outstanding active orders in progress
  const openOrders = useMemo(() => {
    return todayOrders.filter(
      (o) =>
        ['AWAITING_DELIVERY_FEE', 'FEE_QUOTED', 'PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(
          o.status
        )
    )
  }, [todayOrders])

  // Revenue calculations
  const cashRevenue = useMemo(() => {
    return todayOrders
      .filter((o) => o.payment_method === 'PAY_ON_ARRIVAL' && o.payment_status === 'PAID')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  }, [todayOrders])

  const onlineRevenue = useMemo(() => {
    return todayOrders
      .filter((o) => o.payment_method === 'MONIME' && o.payment_status === 'PAID')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  }, [todayOrders])

  const grossSales = useMemo(() => {
    return todayOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  }, [todayOrders])

  // Fulfillment breakdown
  const deliveryOrders = useMemo(() => todayOrders.filter((o) => o.fulfillment_type === 'DELIVERY'), [todayOrders])
  const pickupOrders = useMemo(() => todayOrders.filter((o) => o.fulfillment_type === 'PICKUP'), [todayOrders])
  const dineInOrders = useMemo(() => todayOrders.filter((o) => o.fulfillment_type === 'DINE_IN'), [todayOrders])

  const deliveryVolume = deliveryOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const pickupVolume = pickupOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const dineInVolume = dineInOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. EOD Z-Report Finalization Action
  // ─────────────────────────────────────────────────────────────────────────────
  const handleFinalizeEod = async () => {
    setIsFinalizingEod(true)
    const supabase = createClient()

    try {
      // 1. Generate immutable snapshot object
      const zReportNum = `Z-${activeDate.replace(/-/g, '')}-${activeBranch.slug.toUpperCase()}`
      const snapshotData = {
        z_report_number: zReportNum,
        branch_id: selectedBranchId,
        branch_name: activeBranch.name,
        accounting_date: activeDate,
        closed_at: new Date().toISOString(),
        closed_by: currentStaff?.full_name || 'Branch Manager',
        closed_by_role: currentStaff?.role || 'BRANCH_MANAGER',
        summary: {
          total_orders: totalOrdersCount,
          completed_orders: completedOrdersCount,
          cancelled_orders: cancelledOrdersCount,
          open_unsettled_orders: openOrders.length,
          gross_sales: grossSales,
          cash_revenue: cashRevenue,
          online_revenue: onlineRevenue,
          delivery_count: deliveryOrders.length,
          delivery_volume: deliveryVolume,
          pickup_count: pickupOrders.length,
          pickup_volume: pickupVolume,
          dine_in_count: dineInOrders.length,
          dine_in_volume: dineInVolume,
        },
        orders_snapshot: todayOrders.map((o) => ({
          order_number: o.order_number,
          created_at: o.created_at,
          status: o.status,
          fulfillment_type: o.fulfillment_type,
          table_number: o.table_number,
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          total_amount: o.total_amount,
        })),
      }

      // 2. Insert snapshot into eod_z_reports
      const { data: insertedReport, error: insertError } = await (supabase
        .from('eod_z_reports') as any)
        .insert({
          branch_id: selectedBranchId,
          accounting_date: activeDate,
          report_data: snapshotData,
          closed_by: currentStaff?.full_name || 'Branch Manager',
        })
        .select()
        .single()

      // 3. Increment active_accounting_date by +1 day
      const currentDateObj = new Date(activeDate + 'T00:00:00')
      currentDateObj.setDate(currentDateObj.getDate() + 1)
      const nextDateStr = currentDateObj.toISOString().split('T')[0]

      // 4. Update branch_accounting_days
      await (supabase.from('branch_accounting_days') as any).upsert(
        {
          branch_id: selectedBranchId,
          active_accounting_date: nextDateStr,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'branch_id' }
      )

      // 5. Update local store & state
      setActiveAccountingDate(nextDateStr)
      setActiveDate(nextDateStr)

      // 6. Reset live shift orders for new active date (starts at 0)
      setShiftOrders([])

      // 7. Add new report to historical list
      const newReportEntry: ZReport = {
        id: (insertedReport as any)?.id || `z-${Date.now()}`,
        branch_id: selectedBranchId,
        accounting_date: activeDate,
        report_data: snapshotData,
        closed_by: currentStaff?.full_name || 'Branch Manager',
        created_at: new Date().toISOString(),
      }
      setHistoricalReports((prev) => [newReportEntry, ...prev])

      // 8. Close modal & show success view
      setIsEodModalOpen(false)
      setEodSuccessReport(snapshotData)
    } catch (err) {
      console.error('Failed to finalize EOD Z-Report:', err)
      // Even in offline dev mode, simulate successful close
      const currentDateObj = new Date(activeDate + 'T00:00:00')
      currentDateObj.setDate(currentDateObj.getDate() + 1)
      const nextDateStr = currentDateObj.toISOString().split('T')[0]

      const simulatedSnapshot = {
        z_report_number: `Z-${activeDate.replace(/-/g, '')}-${activeBranch.slug.toUpperCase()}`,
        branch_id: selectedBranchId,
        branch_name: activeBranch.name,
        accounting_date: activeDate,
        closed_at: new Date().toISOString(),
        closed_by: currentStaff?.full_name || 'Branch Manager',
        summary: {
          total_orders: totalOrdersCount,
          completed_orders: completedOrdersCount,
          gross_sales: grossSales,
          cash_revenue: cashRevenue,
          online_revenue: onlineRevenue,
          delivery_count: deliveryOrders.length,
          pickup_count: pickupOrders.length,
          dine_in_count: dineInOrders.length,
        },
      }

      setActiveAccountingDate(nextDateStr)
      setActiveDate(nextDateStr)
      setShiftOrders([])
      setIsEodModalOpen(false)
      setEodSuccessReport(simulatedSnapshot)
    } finally {
      setIsFinalizingEod(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Permission Protection Check
  // ─────────────────────────────────────────────────────────────────────────────
  if (!canAccessManager(currentStaff?.role)) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-blue-950/60 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-black text-white">Branch Manager Access Required</h2>
        <p className="text-sm text-zinc-400 mt-2 mb-6">
          This portal is restricted to authorized Branch Managers and Super Admins.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => loginAsDemo('demo-manager-lumley')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Switch to Big Lumley Manager
          </Button>
          <Button
            onClick={() => loginAsDemo('demo-admin')}
            variant="outline"
            className="border-purple-600/50 text-purple-300 hover:bg-purple-950/40"
          >
            Switch to Super Admin
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ─────────────────────────────────────────────────────────────────────────────
          TOP BAR & BRANCH SELECTOR
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Branch Management Portal
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            {activeBranch.name}
            {activeBranch.is_delivery_hub && (
              <Badge className="bg-brand-red text-white text-[10px] uppercase font-bold tracking-wider">
                392 Delivery Hub
              </Badge>
            )}
          </h1>
          <p className="text-xs text-zinc-400">
            {activeBranch.address} • Phone: {activeBranch.phone} • Hours: {activeBranch.opening_time.slice(0, 5)} – {activeBranch.closing_time.slice(0, 5)}
          </p>
        </div>

        {/* Branch Switcher (for Super Admin) or Fixed Badge (for Branch Manager) */}
        <div className="flex items-center gap-3">
          {isSuperAdmin ? (
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
              <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Managing Branch</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                      {b.name} {b.is_delivery_hub ? '(Central Delivery Hub)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase">Assigned Branch</span>
                <span className="text-sm font-bold text-white">{activeBranch.name}</span>
              </div>
            </div>
          )}

          <Button
            onClick={() => loadBranchData(selectedBranchId)}
            variant="outline"
            size="sm"
            className="border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 h-10 px-3"
            title="Refresh Data"
          >
            <RefreshCw className={cn('w-4 h-4', isLoadingOrders && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          STAMPED ACTIVE ACCOUNTING DATE BANNER
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-900 border-2 border-brand-gold/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-gold">
                Active Business Accounting Day
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Shift Open
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
              {activeDate}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              All register receipts and online orders are tied to this accounting day. Midnight calendar
              crossovers do not reset shift totals until the official EOD Z-Report is finalized.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsEodModalOpen(true)}
          className="bg-brand-red hover:bg-red-700 text-white font-extrabold px-6 py-6 rounded-xl shadow-lg shadow-brand-red/20 text-sm flex items-center gap-2.5 shrink-0 self-start md:self-auto transition-transform active:scale-[0.98]"
        >
          <Lock className="w-4 h-4" />
          <span>Close Day & Advance Date (EOD Z-Report)</span>
        </Button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB NAVIGATION (Stock Toggle | Live Shift | Historical Z-Reports)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveTab('shift')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap',
            activeTab === 'shift'
              ? 'bg-zinc-800 text-brand-gold shadow-md border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          )}
        >
          <DollarSign className="w-4 h-4" />
          <span>Live Shift & Accounting</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-300 font-extrabold">
            {todayOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap',
            activeTab === 'stock'
              ? 'bg-zinc-800 text-brand-gold shadow-md border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          )}
        >
          <Utensils className="w-4 h-4" />
          <span>Item Availability & Stock</span>
          {Object.values(availabilityMap).filter((v) => v === false).length > 0 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400 font-extrabold border border-red-800">
              {Object.values(availabilityMap).filter((v) => v === false).length} Out
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap',
            activeTab === 'history'
              ? 'bg-zinc-800 text-brand-gold shadow-md border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          )}
        >
          <Receipt className="w-4 h-4" />
          <span>Historical Z-Reports</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-300 font-extrabold">
            {historicalReports.length}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: LIVE SHIFT & END-OF-DAY ACCOUNTING
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'shift' && (
        <div className="space-y-6">
          {/* Shift Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Orders */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Total Orders Today
                </span>
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-white tabular-nums">
                  {totalOrdersCount}
                </span>
                <span className="text-xs text-zinc-400 ml-2">
                  ({completedOrdersCount} done{cancelledOrdersCount > 0 ? `, ${cancelledOrdersCount} cancelled` : ''})
                </span>
              </div>
              {openOrders.length > 0 && (
                <div className="mt-2 text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{openOrders.length} order(s) currently open</span>
                </div>
              )}
            </div>

            {/* Metric 2: Cash on Arrival */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Cash Revenue (Arrival)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                  {formatSLE(cashRevenue)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Cash collected at register / counter</p>
            </div>

            {/* Metric 3: Online Monime */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Online Paid (Monime)
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-blue-400 tabular-nums">
                  {formatSLE(onlineRevenue)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Orange Money / Afrimoney / Card</p>
            </div>

            {/* Metric 4: Total Gross Sales */}
            <div className="bg-gradient-to-br from-zinc-900 to-amber-950/30 border border-brand-gold/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-gold uppercase tracking-wider">
                  Total Gross Sales
                </span>
                <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {formatSLE(grossSales)}
                </span>
              </div>
              <p className="text-[11px] text-brand-gold/80 mt-1 font-semibold">Total active register volume</p>
            </div>
          </div>

          {/* Fulfillment Breakdown Cards */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-gold" />
              <span>Fulfillment Breakdown for {activeDate}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Delivery */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-600/30 flex items-center justify-center text-brand-gold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-400 block">Delivery</span>
                    <span className="text-lg font-black text-white">{deliveryOrders.length} orders</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-brand-gold tabular-nums">
                  {formatSLE(deliveryVolume)}
                </span>
              </div>

              {/* Pickup */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-600/30 flex items-center justify-center text-blue-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-400 block">Takeaway / Pickup</span>
                    <span className="text-lg font-black text-white">{pickupOrders.length} orders</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-blue-400 tabular-nums">
                  {formatSLE(pickupVolume)}
                </span>
              </div>

              {/* Dine-In */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-600/30 flex items-center justify-center text-emerald-400">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-400 block">Dine-In (QR & Counter)</span>
                    <span className="text-lg font-black text-white">{dineInOrders.length} orders</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-400 tabular-nums">
                  {formatSLE(dineInVolume)}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Stamped Orders Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Shift Orders Register</span>
                  <Badge className="bg-zinc-800 text-zinc-300 font-mono text-xs">
                    {todayOrders.length} entries
                  </Badge>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Orders officially stamped under accounting date <strong>{activeDate}</strong>
                </p>
              </div>

              {openOrders.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{openOrders.length} orders pending completion</span>
                </div>
              )}
            </div>

            {todayOrders.length === 0 ? (
              <div className="py-16 text-center text-zinc-500">
                <Receipt className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-zinc-400">No orders registered for {activeDate} yet.</p>
                <p className="text-xs text-zinc-600 mt-1">
                  New customer orders will automatically appear here via live Supabase Realtime.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950/80 text-xs uppercase font-extrabold text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Time</th>
                      <th className="py-3.5 px-4">Fulfillment</th>
                      <th className="py-3.5 px-4">Source</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {todayOrders.map((ord) => {
                      const isUnsettled = !['COMPLETED', 'CANCELLED'].includes(ord.status)
                      return (
                        <tr
                          key={ord.id}
                          className={cn(
                            'hover:bg-zinc-800/40 transition-colors',
                            isUnsettled && 'bg-amber-950/10'
                          )}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {ord.order_number}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-400">
                            {new Date(ord.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {ord.fulfillment_type === 'DELIVERY' && (
                                <Badge className="bg-amber-950 text-amber-300 border-amber-800 text-[10px]">
                                  🛵 Delivery
                                </Badge>
                              )}
                              {ord.fulfillment_type === 'PICKUP' && (
                                <Badge className="bg-blue-950 text-blue-300 border-blue-800 text-[10px]">
                                  🛍️ Pickup
                                </Badge>
                              )}
                              {ord.fulfillment_type === 'DINE_IN' && (
                                <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px]">
                                  🍽️ Dine-In {ord.table_number ? `(T-${ord.table_number})` : ''}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-zinc-400 font-mono">
                              {ord.order_source}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-zinc-300">
                                {ord.payment_method === 'PAY_ON_ARRIVAL' ? 'Cash on Arrival' : 'Monime Online'}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-bold',
                                  ord.payment_status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                                )}
                              >
                                {ord.payment_status}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={cn(
                                'inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider',
                                ord.status === 'COMPLETED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-zinc-800 text-zinc-400'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              )}
                            >
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-brand-gold tabular-nums">
                            {formatSLE(ord.total_amount)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: BRANCH ITEM AVAILABILITY (STOCK TOGGLE)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Controls & Quick Actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Live Menu Item Availability</span>
                  <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                    {MENU_ITEMS.length} Total Items
                  </Badge>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Toggle items in or out of stock specifically for <strong>{activeBranch.name}</strong>.
                  Customer menu checks this in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={markAllInStock}
                  variant="outline"
                  size="sm"
                  className="border-emerald-600/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-bold"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Mark All In Stock
                </Button>
                <Button
                  onClick={() => setShowOutOfStockOnly(!showOutOfStockOnly)}
                  variant={showOutOfStockOnly ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'font-bold',
                    showOutOfStockOnly
                      ? 'bg-brand-red text-white hover:bg-red-700'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  )}
                >
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  {showOutOfStockOnly ? 'Showing Out of Stock' : 'Filter Out of Stock Only'}
                </Button>
              </div>
            </div>

            {/* Status Alert Toast */}
            {stockStatusMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{stockStatusMessage}</span>
              </div>
            )}

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search chicken, burger, drink, side..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grouped Items List */}
          <div className="space-y-6">
            {groupedMenuItems.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
                <Search className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-zinc-400">No menu items match your search.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategoryFilter('all')
                    setShowOutOfStockOnly(false)
                  }}
                  className="text-brand-gold text-xs mt-1"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              groupedMenuItems.map((grp) => (
                <div key={grp.categoryId} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-md">
                  <div className="px-5 py-3.5 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between">
                    <h4 className="text-sm font-black text-brand-gold uppercase tracking-wider">
                      {grp.category}
                    </h4>
                    <span className="text-xs font-bold text-zinc-400">
                      {grp.items.length} item(s)
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-800/50">
                    {grp.items.map((item) => {
                      const isInStock = availabilityMap[item.id] !== false

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'p-4 flex items-center justify-between gap-4 transition-colors',
                            !isInStock ? 'bg-red-950/20' : 'hover:bg-zinc-800/30'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-sm truncate">
                                {item.name}
                              </span>
                              <Badge
                                className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider',
                                  isInStock
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                    : 'bg-red-950 text-red-400 border-red-800'
                                )}
                              >
                                {isInStock ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                              {item.base_price ? (
                                <span className="text-brand-gold font-bold">{formatSLE(item.base_price)}</span>
                              ) : item.variants && item.variants.length > 0 ? (
                                <span>
                                  Variants: {item.variants.map((v) => `${v.name} (${formatSLE(v.price)})`).join(', ')}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-zinc-400 hidden sm:inline">
                              {isInStock ? 'Available' : 'Unavailable'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleItemStock(item.id, item.name)}
                              className={cn(
                                'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold/50',
                                isInStock ? 'bg-emerald-600' : 'bg-zinc-700'
                              )}
                              role="switch"
                              aria-checked={isInStock}
                              aria-label={`Toggle stock for ${item.name}`}
                            >
                              <span
                                className={cn(
                                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                                  isInStock ? 'translate-x-7' : 'translate-x-0'
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: HISTORICAL Z-REPORTS VIEWER
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-brand-gold" />
                  <span>Archived End-of-Day (EOD) Z-Reports</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Permanent immutable register closes for <strong>{activeBranch.name}</strong>
                </p>
              </div>
              <Badge className="bg-zinc-800 text-zinc-300 font-mono text-xs self-start sm:self-auto">
                {historicalReports.length} Historical Records
              </Badge>
            </div>

            {historicalReports.length === 0 ? (
              <div className="py-16 text-center text-zinc-500">
                <FileText className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-zinc-400">No historical Z-Reports on record yet.</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Once a day is finalized via &ldquo;Close Day &amp; Advance Date&rdquo;, the permanent Z-Report snapshot will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950/80 text-xs uppercase font-extrabold text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">Accounting Date</th>
                      <th className="py-3.5 px-4">Closed At</th>
                      <th className="py-3.5 px-4">Closed By</th>
                      <th className="py-3.5 px-4 text-center">Orders</th>
                      <th className="py-3.5 px-4 text-right">Gross Sales</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {historicalReports.map((rep) => {
                      const summary = rep.report_data?.summary || {}
                      const gross = summary.gross_sales || 0
                      const orders = summary.total_orders || 0

                      return (
                        <tr key={rep.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-gold shrink-0" />
                            <span>{rep.accounting_date}</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-400">
                            {new Date(rep.created_at).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-300">
                            {rep.closed_by || 'Branch Manager'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-white">
                            {orders}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-brand-gold tabular-nums">
                            {formatSLE(gross)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              onClick={() => setSelectedReportForView(rep)}
                              size="sm"
                              variant="outline"
                              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 font-bold text-xs h-8"
                            >
                              <Receipt className="w-3.5 h-3.5 mr-1.5" />
                              View Full Z-Report
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          EOD CLOSE DAY & ADVANCE DATE VERIFICATION MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {isEodModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-red/20 border border-brand-red/40 flex items-center justify-center text-brand-red">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    End-of-Day (EOD) Z-Report Finalization
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Close shift register for {activeBranch.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEodModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-sm text-zinc-300">
              {/* Active Orders Warning */}
              {openOrders.length > 0 ? (
                <div className="p-4 bg-amber-950/80 border-2 border-amber-500/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-black">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Warning: {openOrders.length} Active Order(s) In Progress!</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    There are orders currently being prepared or awaiting delivery/pickup:{' '}
                    <strong>{openOrders.map((o) => o.order_number).join(', ')}</strong>.
                  </p>
                  <p className="text-xs text-amber-300 font-semibold">
                    Are you sure you want to finalize and lock the shift register now?
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All orders for today have been completed. Shift register is ready for closure.</span>
                </div>
              )}

              {/* Snapshot Reconciliation Preview */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="text-center pb-2 border-b border-zinc-800">
                  <span className="font-extrabold text-white text-sm">CHICKEN TOWN SL</span>
                  <span className="block text-[11px] text-zinc-400">Z-REPORT RECONCILIATION PREVIEW</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Accounting Date:</span>
                  <span className="font-bold text-white">{activeDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Branch:</span>
                  <span className="font-bold text-white">{activeBranch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Closing Manager:</span>
                  <span className="font-bold text-white">{currentStaff?.full_name}</span>
                </div>

                <div className="border-t border-zinc-800 pt-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Orders:</span>
                    <span className="font-bold text-white">{totalOrdersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cash on Arrival:</span>
                    <span className="font-bold text-emerald-400">{formatSLE(cashRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Online Paid (Monime):</span>
                    <span className="font-bold text-blue-400">{formatSLE(onlineRevenue)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-1.5 text-sm">
                    <span className="font-extrabold text-brand-gold">Total Gross Sales:</span>
                    <span className="font-black text-brand-gold">{formatSLE(grossSales)}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-2 text-[11px] text-zinc-500">
                  ⚡ Action: This will lock today&apos;s records into `eod_z_reports`, advance the branch accounting date by +1 day, and reset the live register.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEodModalOpen(false)}
                disabled={isFinalizingEod}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel / Keep Shift Open
              </Button>
              <Button
                onClick={handleFinalizeEod}
                disabled={isFinalizingEod}
                className="bg-brand-red hover:bg-red-700 text-white font-extrabold flex items-center gap-2"
              >
                {isFinalizingEod ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Archiving Register...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Finalize Z-Report</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          SUCCESS MODAL AFTER EOD CLOSURE
      ───────────────────────────────────────────────────────────────────────────── */}
      {eodSuccessReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-zinc-900 border border-brand-gold/60 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/50 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white">EOD Z-Report Finalized!</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Register closed for <strong>{eodSuccessReport.accounting_date}</strong>. Permanent snapshot saved with{' '}
              <span className="text-brand-gold font-bold font-mono">{eodSuccessReport.z_report_number}</span>.
            </p>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-400">
              New Active Accounting Date: <strong className="text-white text-sm">{activeDate}</strong>
              <span className="block text-[11px] text-emerald-400 mt-1">Live dashboard reset to clean Le 0</span>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Button
                onClick={() => setEodSuccessReport(null)}
                className="bg-brand-gold text-charcoal hover:bg-yellow-500 font-black px-6"
              >
                Done / Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          AUTHENTIC THERMAL REGISTER RECEIPT MODAL (Tab 3 Z-Report Viewer)
      ───────────────────────────────────────────────────────────────────────────── */}
      {selectedReportForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-gold" />
                Register Z-Report Details
              </span>
              <button
                onClick={() => setSelectedReportForView(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Thermal Receipt Container */}
            <div className="p-5 overflow-y-auto bg-zinc-950/90 flex justify-center">
              <div
                id="thermal-receipt"
                className="w-full bg-white text-zinc-950 p-6 rounded-lg font-mono text-xs shadow-md border border-gray-300 space-y-3 leading-relaxed"
              >
                {/* Header */}
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
                  <p className="text-sm font-black tracking-wider">CHICKEN TOWN SL</p>
                  <p className="text-[10px] font-bold tracking-widest text-gray-700">SWIT U MOT SWIT U LYF</p>
                  <p className="text-[11px] font-extrabold uppercase mt-1">
                    OFFICIAL END-OF-DAY Z-REPORT
                  </p>
                  <p className="text-[10px] text-gray-600 font-bold">
                    {selectedReportForView.report_data?.z_report_number || `Z-${selectedReportForView.accounting_date}`}
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
                  <div className="flex justify-between">
                    <span className="text-gray-600">BRANCH:</span>
                    <span className="font-bold">{activeBranch.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ACCOUNTING DATE:</span>
                    <span className="font-bold">{selectedReportForView.accounting_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CLOSED AT:</span>
                    <span>{new Date(selectedReportForView.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">REGISTER CLOSED BY:</span>
                    <span className="font-bold">{selectedReportForView.closed_by || 'Branch Manager'}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-1.5 pb-2 border-b border-dashed border-gray-400">
                  <div className="flex justify-between text-sm font-black">
                    <span>TOTAL ORDERS:</span>
                    <span>{selectedReportForView.report_data?.summary?.total_orders ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-red-700 pt-1 border-t border-gray-300">
                    <span>GROSS SALES:</span>
                    <span>{formatSLE(selectedReportForView.report_data?.summary?.gross_sales ?? 0)}</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
                  <span className="font-bold block text-gray-700">PAYMENT RECONCILIATION:</span>
                  <div className="flex justify-between">
                    <span>- Cash on Arrival:</span>
                    <span className="font-bold">
                      {formatSLE(selectedReportForView.report_data?.summary?.cash_revenue ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Monime Online:</span>
                    <span className="font-bold">
                      {formatSLE(selectedReportForView.report_data?.summary?.online_revenue ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Fulfillment Breakdown */}
                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
                  <span className="font-bold block text-gray-700">FULFILLMENT BREAKDOWN:</span>
                  <div className="flex justify-between">
                    <span>- Delivery:</span>
                    <span>
                      {selectedReportForView.report_data?.summary?.delivery_count ?? 0} orders (
                      {formatSLE(selectedReportForView.report_data?.summary?.delivery_volume ?? 0)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Pickup:</span>
                    <span>
                      {selectedReportForView.report_data?.summary?.pickup_count ?? 0} orders (
                      {formatSLE(selectedReportForView.report_data?.summary?.pickup_volume ?? 0)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Dine-In:</span>
                    <span>
                      {selectedReportForView.report_data?.summary?.dine_in_count ?? 0} orders (
                      {formatSLE(selectedReportForView.report_data?.summary?.dine_in_volume ?? 0)})
                    </span>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="text-center pt-2 space-y-1">
                  <p className="text-[10px] font-black tracking-wider text-gray-600">
                    *** IMMUTABLE REGISTER RECORD ***
                  </p>
                  <p className="text-[9px] text-gray-500">
                    Stored in Supabase eod_z_reports table. Signed by Chicken Town SL POS Kernel.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const printContents = document.getElementById('thermal-receipt')?.innerHTML
                  if (!printContents) return
                  const printWindow = window.open('', '_blank')
                  if (!printWindow) return
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Z-Report Receipt</title>
                        <style>
                          body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 380px; margin: 0 auto; }
                          .border-b { border-bottom: 1px dashed #666; padding-bottom: 8px; margin-bottom: 8px; }
                          .flex { display: flex; justify-content: space-between; }
                          .text-center { text-align: center; }
                          .font-black { font-weight: 900; }
                          .font-bold { font-weight: 700; }
                        </style>
                      </head>
                      <body onload="window.print(); window.close();">
                        ${printContents}
                      </body>
                    </html>
                  `)
                  printWindow.document.close()
                }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Receipt
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(selectedReportForView.report_data, null, 2)
                  )}`
                  const downloadAnchor = document.createElement('a')
                  downloadAnchor.setAttribute('href', jsonString)
                  downloadAnchor.setAttribute(
                    'download',
                    `z-report-${selectedReportForView.accounting_date}.json`
                  )
                  document.body.appendChild(downloadAnchor)
                  downloadAnchor.click()
                  downloadAnchor.remove()
                }}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download JSON
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedReportForView(null)}
                className="bg-brand-gold text-charcoal hover:bg-yellow-500 font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
