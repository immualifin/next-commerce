"use client"

import FilterCheckbox from "./filter-checkbox"

interface FilterOption {
  id: string
  label: string
}

interface FilterSectionProps {
  title: string
  paramKey: string
  options: FilterOption[]
}

/**
 * Renders a group of checkboxes for a filter category.
 * Server passes pre-fetched options (brands, categories, locations from DB).
 */
export default function FilterSection({
  title,
  paramKey,
  options,
}: FilterSectionProps) {
  if (options.length === 0) return null

  return (
    <div className="flex flex-col gap-[14px]">
      <p className="font-semibold leading-[22px]">{title}</p>
      {options.map((opt) => (
        <FilterCheckbox
          key={`${paramKey}-${opt.id}`}
          paramKey={paramKey}
          value={opt.id}
          label={opt.label}
        />
      ))}
    </div>
  )
}
