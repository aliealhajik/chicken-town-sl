'use client'

import React, { useState, useEffect } from 'react'
import { Bike, ShoppingBag, Utensils, Lock, Clock, MapPin, AlertCircle } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { getBranches, getRetailBranches, getDeliveryHub } from '@/lib/data/branches'
import { cn } from '@/lib/utils'
import type { FulfillmentType } from '@/types'

/**
 * Validates if a chosen HH:MM time falls within operating hours:
 * 10:00 (10:00 AM) through 02:00 (02:00 AM the following morning).
 * Closed between 02:01 and 09:59.
 */
function isValidOperatingHour(timeStr: string): boolean {
  if (!timeStr) return false
  const [hoursStr, minutesStr] = timeStr.split(':')
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)

  if (isNaN(hours) || isNaN(minutes)) return false

  // Between 10:00 AM (10:00) and 11:59 PM (23:59)
  if (hours >= 10 && hours <= 23) return true
  // Between midnight (00:00) and 2:00 AM (02:00)
  if (hours >= 0 && (hours < 2 || (hours === 2 && minutes === 0))) return true

  return false
}

export function FulfillmentSelector() {
  const {
    fulfillmentType,
    branchId,
    branchName,
    tableNumber,
    isQrLocked,
    isScheduled,
    scheduledTime,
    setFulfillment,
  } = useCartStore()

  const retailBranches = getRetailBranches()
  const deliveryHub = getDeliveryHub()

  const [timeError, setTimeError] = useState<string | null>(null)

  // Validate time on load or change
  useEffect(() => {
    if (isScheduled && scheduledTime) {
      if (!isValidOperatingHour(scheduledTime)) {
        setTimeError('Operating hours are 10:00 AM to 02:00 AM.')
      } else {
        setTimeError(null)
      }
    } else {
      setTimeError(null)
    }
  }, [isScheduled, scheduledTime])

  const handleTypeChange = (type: FulfillmentType) => {
    if (isQrLocked) return // Cannot change when locked to table QR

    if (type === 'DELIVERY') {
      setFulfillment({
        fulfillmentType: 'DELIVERY',
        branchId: deliveryHub.id,
        branchSlug: deliveryHub.slug,
        branchName: deliveryHub.name,
        tableNumber: null,
      })
    } else if (type === 'PICKUP') {
      // Pick first retail branch if currently on delivery hub
      const activeBranch =
        branchId === deliveryHub.id ? retailBranches[0] : (retailBranches.find((b) => b.id === branchId) || retailBranches[0])
      setFulfillment({
        fulfillmentType: 'PICKUP',
        branchId: activeBranch.id,
        branchSlug: activeBranch.slug,
        branchName: activeBranch.name,
        tableNumber: null,
      })
    } else if (type === 'DINE_IN') {
      const activeBranch =
        branchId === deliveryHub.id ? retailBranches[0] : (retailBranches.find((b) => b.id === branchId) || retailBranches[0])
      setFulfillment({
        fulfillmentType: 'DINE_IN',
        branchId: activeBranch.id,
        branchSlug: activeBranch.slug,
        branchName: activeBranch.name,
      })
    }
  }

  const handleBranchSelect = (selectedId: string) => {
    const branch = getBranches().find((b) => b.id === selectedId)
    if (branch) {
      setFulfillment({
        branchId: branch.id,
        branchSlug: branch.slug,
        branchName: branch.name,
      })
    }
  }

  const handleScheduleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setFulfillment({
      isScheduled: checked,
      scheduledTime: checked ? scheduledTime || '12:00' : null,
    })
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFulfillment({
      isScheduled: true,
      scheduledTime: val,
    })
    if (!isValidOperatingHour(val)) {
      setTimeError('Operating hours are 10:00 AM to 02:00 AM.')
    } else {
      setTimeError(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-4 md:p-5 space-y-4">
      {/* QR Lock Notification Banner */}
      {isQrLocked && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Dine-in locked for <strong>{branchName}</strong> — Table{' '}
            <strong>{tableNumber || 'Assigned'}</strong>
          </span>
        </div>
      )}

      {/* Segmented Controls for Delivery / Pickup / Dine-In */}
      <div className="grid grid-cols-3 gap-2 bg-muted/70 p-1.5 rounded-xl">
        {/* Delivery Button */}
        <button
          type="button"
          onClick={() => handleTypeChange('DELIVERY')}
          disabled={isQrLocked}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-150',
            fulfillmentType === 'DELIVERY'
              ? 'bg-brand-red text-white shadow-sm'
              : 'text-charcoal hover:bg-white/60 active:bg-white/80',
            isQrLocked && 'opacity-40 cursor-not-allowed hover:bg-transparent'
          )}
        >
          <Bike className="w-4 h-4" />
          <span>Delivery</span>
        </button>

        {/* Pickup Button */}
        <button
          type="button"
          onClick={() => handleTypeChange('PICKUP')}
          disabled={isQrLocked}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-150',
            fulfillmentType === 'PICKUP'
              ? 'bg-brand-red text-white shadow-sm'
              : 'text-charcoal hover:bg-white/60 active:bg-white/80',
            isQrLocked && 'opacity-40 cursor-not-allowed hover:bg-transparent'
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pickup</span>
        </button>

        {/* Dine-In Button */}
        <button
          type="button"
          onClick={() => handleTypeChange('DINE_IN')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-150',
            fulfillmentType === 'DINE_IN'
              ? 'bg-brand-red text-white shadow-sm'
              : 'text-charcoal hover:bg-white/60 active:bg-white/80'
          )}
        >
          <Utensils className="w-4 h-4" />
          <span>Dine-In</span>
        </button>
      </div>

      {/* Branch Selection or Locked Delivery Hub Notice */}
      <div className="pt-1">
        {fulfillmentType === 'DELIVERY' && (
          <div className="flex items-center gap-2 text-xs md:text-sm text-charcoal/80 bg-gray-50 border border-gray-200/80 rounded-xl px-3.5 py-2.5">
            <MapPin className="w-4 h-4 text-brand-red shrink-0" />
            <div>
              <span>Dispatched directly from </span>
              <strong className="text-charcoal font-semibold">{deliveryHub.name} (Central Delivery Hub)</strong>
              <span className="text-muted-foreground block text-xs">Fast delivery across Greater Freetown</span>
            </div>
          </div>
        )}

        {(fulfillmentType === 'PICKUP' || (fulfillmentType === 'DINE_IN' && !isQrLocked)) && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
              {fulfillmentType === 'PICKUP' ? 'Select Pickup Branch' : 'Select Dining Branch'}
            </label>
            <div className="relative">
              <select
                value={branchId}
                onChange={(e) => handleBranchSelect(e.target.value)}
                className="w-full appearance-none bg-background border border-input rounded-xl px-3.5 py-2.5 pr-8 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              >
                {retailBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} — {branch.address}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-brand-red" />
              </div>
            </div>
          </div>
        )}

        {fulfillmentType === 'DINE_IN' && !isQrLocked && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-1">
              Table Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Table 12 or Booth 3"
              value={tableNumber || ''}
              onChange={(e) => setFulfillment({ tableNumber: e.target.value || null })}
              className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Scheduled Order Toggle */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <label htmlFor="schedule-order-toggle" className="flex items-center gap-2 cursor-pointer select-none">
            <Clock className="w-4 h-4 text-brand-gold shrink-0" />
            <span className="text-sm font-semibold text-charcoal">Schedule for later today</span>
          </label>
          <input
            id="schedule-order-toggle"
            type="checkbox"
            checked={isScheduled}
            onChange={handleScheduleToggle}
            className="w-4 h-4 rounded text-brand-red focus:ring-brand-red accent-brand-red cursor-pointer"
          />
        </div>

        {isScheduled && (
          <div className="mt-3 p-3 bg-muted/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-charcoal font-medium">Desired Time (10:00 AM – 02:00 AM):</span>
              <input
                type="time"
                value={scheduledTime || '13:00'}
                onChange={handleTimeChange}
                className="bg-white border border-input rounded-lg px-2.5 py-1 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            {timeError && (
              <div className="flex items-center gap-1.5 text-xs text-brand-red font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{timeError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
