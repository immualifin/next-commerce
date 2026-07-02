"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"

interface FilterCheckboxProps {
  paramKey: string
  value: string
  label: string
}

/**
 * Single checkbox that toggles a key=value pair in the URL search params.
 * Supports multiple values for the same key: ?stock=ready&stock=preorder
 */
export default function FilterCheckbox({
  paramKey,
  value,
  label,
}: FilterCheckboxProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedValues = searchParams.getAll(paramKey)
  const checked = selectedValues.includes(value)

  const handleChange = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (checked) {
      // Remove this specific key=value pair
      params.delete(paramKey, value)
    } else {
      // Add the key=value pair
      params.append(paramKey, value)
    }

    router.push(`${pathname}?${params.toString()}`)
  }, [checked, paramKey, value, pathname, router, searchParams])

  return (
    <label
      htmlFor={`${paramKey}-${value}`}
      className="flex cursor-pointer items-center gap-3 font-semibold"
    >
      <input
        type="checkbox"
        id={`${paramKey}-${value}`}
        checked={checked}
        onChange={handleChange}
        className="flex size-6 shrink-0 appearance-none rounded-md ring-1 ring-[#0D5CD7] checked:border-[3px] checked:border-solid checked:border-white checked:bg-[#0D5CD7]"
      />
      <span>{label}</span>
    </label>
  )
}
