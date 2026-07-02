"use client"

import Link from "next/link"
import { Trash2Icon, HeartIcon } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import { rupiahFormat } from "@/lib/rupiah-format"
import { useCart } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function WishlistItems() {
  const { items, removeItem } = useWishlist()
  const { addProduct } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="flex size-20 items-center justify-center rounded-full bg-[#EFF3FA]">
          <HeartIcon className="size-10 text-[#6A7789]" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          Your wishlist is empty
        </h2>
        <p className="mt-2 text-sm text-[#6A7789]">
          Save items you love and come back to them anytime.
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

  function handleMoveToCart(item: (typeof items)[0]) {
    addProduct({ ...item, quantity: 1 })
    removeItem(item.id)
    toast.success("Moved to cart!")
    router.push("/carts")
  }

  return (
    <div className="mt-[30px] flex flex-col gap-5">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-[20px] border border-[#E5E5E5] bg-white p-5"
        >
          {/* Product info */}
          <Link
            href={`/products/${item.id}`}
            className="flex w-[340px] items-center gap-5"
          >
            <div className="flex h-[70px] w-[120px] shrink-0 items-center justify-center overflow-hidden">
              <img
                src={item.image_url}
                className="h-full w-full object-contain"
                alt={item.name}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold leading-[22px] text-gray-900">
                {item.name}
              </p>
              <p className="text-sm text-[#616369]">{item.category_name}</p>
            </div>
          </Link>

          {/* Price */}
          <div className="flex w-[150px] flex-col gap-1">
            <p className="text-sm text-[#616369]">Price</p>
            <p className="font-semibold leading-[22px] text-[#0D5CD7]">
              {rupiahFormat(item.price)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleMoveToCart(item)}
              className="rounded-full bg-[#0D5CD7] p-[12px_24px] text-center font-semibold text-white transition-all hover:bg-[#0D5CD7]/90"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => {
                removeItem(item.id)
                toast.success("Removed from wishlist")
              }}
              className="flex size-10 items-center justify-center rounded-full border border-[#E5E5E5] text-[#6A7789] transition-all hover:border-red-300 hover:text-red-500"
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
