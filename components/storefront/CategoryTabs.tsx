'use client'

import React, { useRef } from 'react'
import { cn } from '@/lib/utils'

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

interface CategoryTabsProps {
  categories: Category[]
  activeCategoryId: string
  onSelectCategory: (categoryId: string) => void
  className?: string
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
  className,
}: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCategoryClick = (categoryId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(categoryId)
    // Scroll button into view smoothly
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/80 py-2.5 transition-all',
        className
      )}
    >
      <div
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 max-w-7xl mx-auto scroll-smooth"
      >
        {/* All Items / Entire Menu Tab */}
        <button
          type="button"
          onClick={(e) => handleCategoryClick('all', e)}
          className={cn(
            'whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 shrink-0 shadow-sm',
            activeCategoryId === 'all'
              ? 'bg-brand-red text-white shadow-brand-red/20 ring-2 ring-brand-red'
              : 'bg-white text-charcoal/80 border border-border hover:bg-muted/80 hover:text-charcoal'
          )}
        >
          All Items
        </button>

        {/* Dynamic Category Tabs */}
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id
          return (
            <button
              key={category.id}
              type="button"
              onClick={(e) => handleCategoryClick(category.id, e)}
              className={cn(
                'whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 shrink-0 shadow-sm',
                isActive
                  ? 'bg-brand-red text-white shadow-brand-red/20 ring-2 ring-brand-red'
                  : 'bg-white text-charcoal/80 border border-border hover:bg-muted/80 hover:text-charcoal'
              )}
            >
              {category.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
