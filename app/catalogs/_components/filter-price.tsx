"use client"

import {
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation"
import { useState, useEffect } from "react"

export default function FilterPrice() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") ?? "",
  )
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") ?? "",
  )

  // Debounced update for min price
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (minPrice && Number(minPrice) > 0) {
        params.set("minPrice", minPrice)
      } else {
        params.delete("minPrice")
      }
      router.push(`${pathname}?${params.toString()}`)
    }, 1500)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice])

  // Debounced update for max price
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (maxPrice && Number(maxPrice) > 0) {
        params.set("maxPrice", maxPrice)
      } else {
        params.delete("maxPrice")
      }
      router.push(`${pathname}?${params.toString()}`)
    }, 1500)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPrice])

  return (
    <div className="flex flex-col gap-[14px]">
      <p className="font-semibold leading-[22px]">Price Range</p>
      <div className="flex w-full items-center gap-[10px] rounded-full border border-[#E5E5E5] bg-white p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
        <div className="flex shrink-0">
          <img src="/assets/icons/dollar-circle.svg" alt="price" />
        </div>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
          placeholder="Minimum price"
        />
      </div>
      <div className="flex w-full items-center gap-[10px] rounded-full border border-[#E5E5E5] bg-white p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
        <div className="flex shrink-0">
          <img src="/assets/icons/dollar-circle.svg" alt="price" />
        </div>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
          placeholder="Maximum price"
        />
      </div>
    </div>
  )
}
