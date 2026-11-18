'use client'

import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search our menu…',
  className,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div
      className={cn(
        'relative flex items-center w-full max-w-7xl mx-auto px-4',
        className
      )}
    >
      <div className="relative w-full">
        {/* Search Icon */}
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        />

        {/* Input */}
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-white border border-border rounded-2xl',
            'pl-10 pr-10 py-3',
            'text-sm font-medium text-charcoal placeholder:text-muted-foreground',
            'shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red',
            'transition-all duration-200'
          )}
        />

        {/* Clear Button — visible only when there's a value */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-charcoal/70 hover:text-charcoal transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
