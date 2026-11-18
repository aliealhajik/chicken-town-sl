'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Minus, Plus, X, Info, Check, AlertCircle } from 'lucide-react'
import { cn, formatSLE } from '@/lib/utils'
import type { MenuItem, ItemVariant, ModifierGroup, ModifierOption } from '@/lib/data/menu-data'
import type { SelectedModifier, CartItem } from '@/store/useCartStore'
import { useCartStore } from '@/store/useCartStore'

export interface ItemCustomizerModalProps {
  open?: boolean
  isOpen?: boolean
  item: MenuItem | null
  onClose: () => void
  onAddToCart?: (cartItem: CartItem) => void
}

export function ItemCustomizerModal({
  open,
  isOpen,
  item,
  onClose,
  onAddToCart,
}: ItemCustomizerModalProps) {
  const isModalOpen = open ?? isOpen ?? (item !== null)
  const addItem = useCartStore((s) => s.addItem)

  // Selected variant ID
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // Map of groupId -> { optionId: count }
  const [modifierCounts, setModifierCounts] = useState<Record<string, Record<string, number>>>({})

  // Item quantity
  const [quantity, setQuantity] = useState<number>(1)

  // Re-initialize state whenever item opens or changes
  useEffect(() => {
    if (item) {
      if (item.variants && item.variants.length > 0) {
        setSelectedVariantId(item.variants[0].id)
      } else {
        setSelectedVariantId(null)
      }
      setModifierCounts({})
      setQuantity(1)
    }
  }, [item?.id])

  if (!isModalOpen || !item) {
    return null
  }

  const hasVariants = (item.variants?.length ?? 0) > 0
  const hasModifierGroups = (item.modifier_groups?.length ?? 0) > 0

  const selectedVariant: ItemVariant | null = hasVariants
    ? (item.variants?.find((v) => v.id === selectedVariantId) ?? item.variants![0])
    : null

  const basePrice = selectedVariant ? selectedVariant.price : (item.base_price ?? 0)

  // Calculate total price delta from modifiers
  const modTotal = useMemo(() => {
    if (!hasModifierGroups || !item.modifier_groups) return 0
    let total = 0
    for (const group of item.modifier_groups) {
      const counts = modifierCounts[group.id] || {}
      for (const option of group.options) {
        const count = counts[option.id] || 0
        if (count > 0) {
          total += (option.price_delta || 0) * count
        }
      }
    }
    return total
  }, [hasModifierGroups, item.modifier_groups, modifierCounts])

  const unitPrice = basePrice + modTotal
  const totalPrice = unitPrice * quantity

  // Check required modifier groups validation
  const { isValid, incompleteGroups } = useMemo(() => {
    if (!hasModifierGroups || !item.modifier_groups) {
      return { isValid: true, incompleteGroups: [] }
    }

    const incomplete: string[] = []
    for (const group of item.modifier_groups) {
      const isReq = group.required || (group.min_selections ?? 0) > 0
      if (!isReq) continue

      const counts = modifierCounts[group.id] || {}
      const totalSelections = Object.values(counts).reduce((sum, count) => sum + count, 0)

      if (totalSelections < group.min_selections) {
        incomplete.push(`${group.name} (need ${group.min_selections - totalSelections} more)`)
      }
    }
    return { isValid: incomplete.length === 0, incompleteGroups: incomplete }
  }, [hasModifierGroups, item.modifier_groups, modifierCounts])

  // Single select (radio toggle)
  const handleSingleSelect = (group: ModifierGroup, option: ModifierOption) => {
    setModifierCounts((prev) => {
      const current = prev[group.id] || {}
      const isSelected = (current[option.id] || 0) > 0

      if (isSelected) {
        // If optional, allow unselecting
        if (!group.required && group.min_selections === 0) {
          return { ...prev, [group.id]: {} }
        }
        return prev
      }

      // Select new option, clear other options in this group
      return { ...prev, [group.id]: { [option.id]: 1 } }
    })
  }

  // Multi select quantity increment / decrement
  const handleMultiQuantityChange = (group: ModifierGroup, option: ModifierOption, delta: number) => {
    setModifierCounts((prev) => {
      const currentGroup = prev[group.id] || {}
      const currentOptionCount = currentGroup[option.id] || 0
      const totalInGroup = Object.values(currentGroup).reduce((sum, c) => sum + c, 0)

      if (delta > 0) {
        if (totalInGroup >= group.max_selections) {
          return prev // Already reached group limit
        }
        const newCount = currentOptionCount + 1
        return {
          ...prev,
          [group.id]: {
            ...currentGroup,
            [option.id]: newCount,
          },
        }
      } else {
        if (currentOptionCount <= 0) return prev
        const newCount = currentOptionCount - 1
        const updated = { ...currentGroup }
        if (newCount <= 0) {
          delete updated[option.id]
        } else {
          updated[option.id] = newCount
        }
        return {
          ...prev,
          [group.id]: updated,
        }
      }
    })
  }

  const handleAddToCart = () => {
    if (!isValid) return

    const flatModifiers: SelectedModifier[] = []
    if (hasModifierGroups && item.modifier_groups) {
      for (const group of item.modifier_groups) {
        const counts = modifierCounts[group.id] || {}
        for (const option of group.options) {
          const count = counts[option.id] || 0
          for (let i = 0; i < count; i++) {
            flatModifiers.push({
              groupId: group.id,
              groupName: group.name,
              optionId: option.id,
              optionName: option.name,
              priceDelta: option.price_delta || 0,
            })
          }
        }
      }
    }

    const payload = {
      menuItemId: item.id,
      name: item.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      unitPrice,
      quantity,
      selectedModifiers: flatModifiers,
    }

    addItem(payload)

    onAddToCart?.({
      ...payload,
      id: '',
      itemTotal: unitPrice * quantity,
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${item.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-border shrink-0 bg-white">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-charcoal leading-tight truncate">
                {item.name}
              </h2>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-charcoal/70">
                Base:{' '}
                <strong className="text-brand-red font-bold">
                  {formatSLE(basePrice)}
                </strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-charcoal transition-colors"
            aria-label="Close customizer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {/* Variants Section */}
          {hasVariants && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-charcoal flex items-center gap-1.5">
                  Choose Size / Variant
                </h3>
                <span className="text-[11px] font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded-full">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {item.variants!.map((variant) => {
                  const isActive = selectedVariantId === variant.id
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        'flex flex-col items-start px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left',
                        isActive
                          ? 'border-brand-red bg-brand-red/5 text-charcoal ring-1 ring-brand-red/30'
                          : 'border-border bg-white hover:border-brand-red/40 text-charcoal'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm text-charcoal">{variant.name}</span>
                        {isActive && <Check className="w-4 h-4 text-brand-red shrink-0" />}
                      </div>
                      <span className={cn('text-sm font-black mt-1', isActive ? 'text-brand-red' : 'text-charcoal')}>
                        {formatSLE(variant.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Modifier Groups */}
          {hasModifierGroups &&
            item.modifier_groups!.map((group) => {
              const counts = modifierCounts[group.id] || {}
              const totalSelections = Object.values(counts).reduce((sum, c) => sum + c, 0)
              const isRequired = group.required || (group.min_selections ?? 0) > 0
              const isSatisfied = !isRequired || totalSelections >= group.min_selections
              const isSingleChoice = group.max_selections === 1

              return (
                <div key={group.id} className="space-y-3 bg-gray-50/70 rounded-xl p-3.5 border border-border/80">
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-charcoal flex items-center gap-1.5">
                        {group.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isSingleChoice
                          ? isRequired
                            ? 'Select 1 option'
                            : 'Optional (choose up to 1)'
                          : group.min_selections === group.max_selections
                          ? `Select exactly ${group.max_selections}`
                          : `Select ${group.min_selections} to ${group.max_selections} options`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
                          isSatisfied
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        )}
                      >
                        {isSatisfied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </>
                        ) : (
                          <span>Required</span>
                        )}
                      </span>
                      <span className="text-xs font-bold text-charcoal bg-white px-2 py-0.5 rounded-md border border-border shadow-sm">
                        {totalSelections} / {group.max_selections}
                      </span>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const count = counts[option.id] || 0
                      const isSelected = count > 0

                      if (isSingleChoice) {
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSingleSelect(group, option)}
                            className={cn(
                              'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-150 text-left',
                              isSelected
                                ? 'border-brand-red bg-white shadow-sm ring-1 ring-brand-red/30'
                                : 'border-border bg-white hover:border-brand-red/40'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                                  isSelected ? 'border-brand-red bg-brand-red' : 'border-gray-300 bg-white'
                                )}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="text-sm font-semibold text-charcoal">{option.name}</span>
                            </div>
                            {option.price_delta > 0 && (
                              <span className="text-xs font-bold text-brand-red ml-2 shrink-0">
                                +{formatSLE(option.price_delta)}
                              </span>
                            )}
                          </button>
                        )
                      }

                      // Multi-choice group (stepper for multiple counts of each option, e.g. 5 drinks or 10 ice creams)
                      const canIncrement = totalSelections < group.max_selections
                      const canDecrement = count > 0

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-white transition-all duration-150',
                            isSelected
                              ? 'border-brand-red/80 bg-red-50/20 shadow-sm'
                              : 'border-border hover:border-gray-300'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="text-sm font-semibold text-charcoal truncate">{option.name}</span>
                            {option.price_delta > 0 && (
                              <span className="text-xs font-bold text-brand-red shrink-0">
                                +{formatSLE(option.price_delta)}
                              </span>
                            )}
                          </div>

                          {/* Stepper for this option */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMultiQuantityChange(group, option, -1)}
                              disabled={!canDecrement}
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center border transition-colors',
                                canDecrement
                                  ? 'border-gray-300 bg-white hover:bg-gray-100 text-charcoal'
                                  : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                              )}
                              aria-label={`Decrease ${option.name}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span
                              className={cn(
                                'w-6 text-center text-sm font-extrabold tabular-nums',
                                count > 0 ? 'text-brand-red' : 'text-gray-400'
                              )}
                            >
                              {count}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleMultiQuantityChange(group, option, 1)}
                              disabled={!canIncrement}
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center border transition-colors',
                                canIncrement
                                  ? 'border-brand-red bg-brand-red text-white hover:bg-red-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                              )}
                              aria-label={`Increase ${option.name}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

          {/* Validation message for incomplete required groups */}
          {!isValid && incompleteGroups.length > 0 && (
            <div className="flex items-start gap-2.5 p-3.5 bg-orange-50 border border-orange-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
              <div className="text-xs text-orange-900 leading-snug">
                <span className="font-bold">Required selections missing:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {incompleteGroups.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer — Quantity Stepper + Add to Cart Button */}
        <div className="p-5 border-t border-border shrink-0 space-y-3.5 bg-white">
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-charcoal">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease item quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-black text-charcoal text-base tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                disabled={quantity >= 20}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase item quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isValid}
            title={!isValid ? 'Please complete required options' : undefined}
            className={cn(
              'w-full py-4 px-6 rounded-xl font-black text-base transition-all duration-200 flex items-center justify-between shadow-lg active:scale-[0.99]',
              isValid
                ? 'bg-brand-red text-white hover:bg-red-700 shadow-brand-red/20 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            )}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </div>
            <span className="tabular-nums font-black text-lg">
              {formatSLE(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemCustomizerModal
