"use client"

import {
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation"
import { useState, useEffect } from "react"

/**
 * Search bar with debounced URL update.
 * Breadcrumb: Shop / Browse / Catalog
 */
export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("search") ?? "")

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) {
        params.set("search", query.trim())
      } else {
        params.delete("search")
      }
      router.push(`${pathname}?${params.toString()}`)
    }, 1500)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div
      id="title"
      className="container mx-auto flex max-w-[1130px] items-center justify-between"
    >
      {/* Breadcrumb + Title */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          <span className="text-sm text-[#6A7789]">Shop</span>
          <span className="text-sm text-[#6A7789]">/</span>
          <span className="text-sm text-black">Browse</span>
          <span className="text-sm text-[#6A7789]">/</span>
          <span className="text-sm text-black">Catalog</span>
        </div>
        <h1 className="text-4xl font-bold leading-9 text-gray-900">
          Our Product Catalog
        </h1>
      </div>

      {/* Search input */}
      <div className="flex w-full max-w-[480px] items-center gap-[10px] rounded-full border border-[#E5E5E5] bg-white p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
          placeholder="Search product by name, brand, category"
        />
        <button type="button" className="flex shrink-0">
          <img src="/assets/icons/search-normal.svg" alt="search" />
        </button>
      </div>
    </div>
  )
}
