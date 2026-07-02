"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { rupiahFormat } from "@/lib/rupiah-format"
import Link from "next/link"

export default function CartProducts() {
  const { products, increaseQuantity, decreaseQuantity, removeProduct } =
    useCart()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Prevent hydration mismatch — sessionStorage only available client-side
  if (!mounted) return null

  if (products.length === 0) {
    return (
      <div
        id="cart"
        className="container mx-auto mt-[50px] flex max-w-[1130px] flex-col items-center justify-center py-16"
      >
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EFF3FA]">
          <img
            src="/assets/icons/box.svg"
            alt="empty cart"
            className="size-10 opacity-40"
          />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-[#6A7789]">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/catalogs"
          className="mt-6 rounded-full bg-[#0D5CD7] px-6 py-3 font-semibold text-white transition-all hover:bg-[#0D5CD7]/90"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div
      id="cart"
      className="container mx-auto mt-[50px] flex max-w-[1130px] flex-col gap-5"
    >
      {products.map((cart) => (
        <div
          key={cart.id}
          className="product-total-card flex items-center justify-between rounded-[20px] border border-[#E5E5E5] bg-white p-5"
        >
          {/* Product info */}
          <div className="flex w-[340px] items-center gap-5">
            <div className="flex h-[70px] w-[120px] shrink-0 items-center justify-center overflow-hidden">
              <img
                src={cart.image_url}
                className="h-full w-full object-contain"
                alt={cart.name}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold leading-[22px] text-gray-900">
                {cart.name}
              </p>
              <p className="text-sm text-[#616369]">{cart.category_name}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex w-[150px] flex-col gap-1">
            <p className="text-sm text-[#616369]">Price</p>
            <p className="font-semibold leading-[22px] text-[#0D5CD7]">
              {rupiahFormat(cart.price)}
            </p>
          </div>

          {/* Quantity */}
          <div className="flex w-[120px] flex-col gap-1">
            <p className="text-sm text-[#616369]">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => decreaseQuantity(cart.id)}
                className="flex size-6 shrink-0"
              >
                <img src="/assets/icons/minus-cirlce.svg" alt="minus" />
              </button>
              <p className="font-semibold leading-[22px] text-[#0D5CD7]">
                {cart.quantity}
              </p>
              <button
                type="button"
                onClick={() => increaseQuantity(cart.id)}
                className="flex size-6 shrink-0"
              >
                <img src="/assets/icons/add-circle.svg" alt="plus" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="flex w-[150px] flex-col gap-1">
            <p className="text-sm text-[#616369]">Total</p>
            <p className="font-semibold leading-[22px] text-[#0D5CD7]">
              {rupiahFormat(cart.price * cart.quantity)}
            </p>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeProduct(cart.id)}
            className="rounded-full border border-[#E5E5E5] bg-white p-[12px_24px] text-center font-semibold text-gray-700 transition-all hover:border-red-300 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}
