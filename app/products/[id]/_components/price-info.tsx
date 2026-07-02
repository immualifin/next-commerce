"use client"

import { rupiahFormat } from "@/lib/rupiah-format"

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
            disabled={!isLogin}
            type="button"
            className="rounded-full bg-[#0D5CD7] p-[12px_24px] text-center font-semibold text-white disabled:opacity-60"
          >
            Add to Cart
          </button>
          <button
            type="button"
            className="rounded-full border border-[#E5E5E5] bg-white p-[12px_24px] text-center font-semibold text-gray-900"
          >
            Save to Wishlist
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
