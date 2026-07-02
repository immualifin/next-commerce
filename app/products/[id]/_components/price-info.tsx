"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Heart, Loader2 } from "lucide-react"
import { rupiahFormat } from "@/lib/rupiah-format"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

interface PriceInfoProps {
  item: {
    id: string
    name: string
    price: number
    image_url: string
    category_name: string
  }
  isLogin: boolean
}

const features = [
  "Peti telur packaging",
  "Manual book instructions",
  "Customer service 24/7",
  "Free delivery Jabodetabek",
  "Kwitansi orisinal 100%",
]

export default function PriceInfo({ item, isLogin }: PriceInfoProps) {
  const { addProduct } = useCart()
  const { addItem, isInWishlist } = useWishlist()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)

  // Prevent hydration mismatch: wishlist state lives in sessionStorage
  // which is only available on the client.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function handleAddToCart() {
    if (isAdding) return
    setIsAdding(true)
    addProduct({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      category_name: item.category_name,
      quantity: 1,
    })
    router.push("/carts")
  }

  function handleSaveToWishlist() {
    if (!isLogin) {
      router.push("/sign-in")
      return
    }

    if (isInWishlist(item.id)) {
      toast.info("Already in your wishlist")
      return
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      category_name: item.category_name,
    })
    toast.success("Saved to wishlist! ❤️", {
      description: item.name,
    })
  }

  const alreadyWishlisted = mounted && isInWishlist(item.id)

  return (
    <div className="flex w-[302px] shrink-0 flex-col gap-5">
      {/* Price card */}
      <div className="flex w-full flex-col gap-[30px] rounded-3xl border border-[#E5E5E5] bg-white p-[30px]">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-gray-900">Brand New</p>
          <p className="text-[28px] font-bold leading-[48px] text-[#0D5CD7]">
            {rupiahFormat(item.price)}
          </p>
        </div>

        {/* Feature checklist */}
        <div className="flex flex-col gap-4">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="flex shrink-0">
                <img src="/assets/icons/tick-circle.svg" alt="check" />
              </div>
              <p className="font-semibold text-gray-900">{f}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            disabled={!isLogin || isAdding}
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D5CD7] p-[12px_24px] text-center font-semibold text-white transition-all hover:bg-[#0A4BB5] hover:shadow-lg hover:shadow-[#0D5CD7]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#0D5CD7] disabled:hover:shadow-none"
          >
            {isAdding ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
          <button
            type="button"
            disabled={alreadyWishlisted}
            onClick={handleSaveToWishlist}
            className={`rounded-full border p-[12px_24px] text-center font-semibold transition-all ${
              alreadyWishlisted
                ? "cursor-default border-gray-300 bg-gray-100 text-gray-400"
                : "border-[#E5E5E5] bg-white text-gray-900 hover:border-[#FFC736]"
            }`}
          >
            {alreadyWishlisted ? (
              <span className="inline-flex items-center gap-2">
                <Heart className="size-5 fill-gray-400 text-gray-400" />
                Saved to Wishlist
              </span>
            ) : (
              "Save to Wishlist"
            )}
          </button>
        </div>
      </div>

      {/* Buy as Gift banner */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-3xl border border-[#E5E5E5] bg-white p-5 text-left transition-all hover:border-[#FFC736]"
      >
        <div className="flex items-center gap-[10px]">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
            <img src="/assets/icons/cake.svg" alt="gift" />
          </div>
          <div className="flex flex-col gap-[2px]">
            <p className="font-semibold text-gray-900">Buy as a Gift</p>
            <p className="text-sm text-[#6A7789]">Free Delivery</p>
          </div>
        </div>
        <div className="flex shrink-0">
          <img src="/assets/icons/arrow-right.svg" alt="arrow" />
        </div>
      </button>
    </div>
  )
}
