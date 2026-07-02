"use client"

import { useState, useEffect, useMemo, useActionState } from "react"
import { useCart } from "@/hooks/use-cart"
import { rupiahFormat } from "@/lib/rupiah-format"
import { storeOrder } from "../lib/actions"
import { Loader2 } from "lucide-react"

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D5CD7] p-[12px_24px] text-center font-semibold text-white transition-all hover:bg-[#0A4BB5] hover:shadow-lg hover:shadow-[#0D5CD7]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#0D5CD7] disabled:hover:shadow-none"
    >
      {isPending ? (
        <>
          <Loader2 className="size-5 animate-spin" />
          Processing...
        </>
      ) : (
        "Checkout Now"
      )}
    </button>
  )
}

export default function CheckoutForm() {
  const { products } = useCart()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const grandTotal = useMemo(
    () => products.reduce((prev, curr) => prev + curr.price * curr.quantity, 0),
    [products],
  )

  const storeOrderWithTotal = (
    _prevState: { error: string | null },
    formData: FormData,
  ) => storeOrder(_prevState, formData, grandTotal, products)
  const [state, formAction, isPending] = useActionState(
    storeOrderWithTotal,
    { error: null },
  )

  // Wait for client hydration — sessionStorage not available during SSR
  if (!mounted) return null
  if (products.length === 0) return null

  return (
    <form
      action={formAction}
      id="checkout-info"
      className="container mx-auto mt-[50px] flex max-w-[1130px] justify-between gap-5 pb-[100px]"
    >
      {/* Shipping Address */}
      <div className="flex w-[650px] shrink-0 flex-col gap-4">
        <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
          Your Shipping Address
        </h2>
        <div className="flex flex-col gap-5 rounded-3xl border border-[#E5E5E5] bg-white p-[30px]">
          <div className="flex items-center gap-[10px] rounded-full border border-[#E5E5E5] p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
            <div className="flex shrink-0">
              <img src="/assets/icons/profile-circle.svg" alt="icon" />
            </div>
            <input
              type="text"
              name="name"
              className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
              placeholder="Write your real complete name"
              required
            />
          </div>
          <div className="flex items-center gap-[10px] rounded-full border border-[#E5E5E5] p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
            <div className="flex shrink-0">
              <img src="/assets/icons/house-2.svg" alt="icon" />
            </div>
            <input
              type="text"
              name="address"
              className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
              placeholder="Write your active house address"
              required
            />
          </div>
          <div className="flex items-center gap-[30px]">
            <div className="flex flex-1 items-center gap-[10px] rounded-full border border-[#E5E5E5] p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
              <div className="flex shrink-0">
                <img src="/assets/icons/global.svg" alt="icon" />
              </div>
              <input
                type="text"
                name="city"
                className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
                placeholder="City"
                required
              />
            </div>
            <div className="flex flex-1 items-center gap-[10px] rounded-full border border-[#E5E5E5] p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
              <div className="flex shrink-0">
                <img src="/assets/icons/location.svg" alt="icon" />
              </div>
              <input
                type="text"
                name="postal_code"
                className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
                placeholder="Post code"
                required
              />
            </div>
          </div>
          <div className="flex items-start gap-[10px] rounded-[20px] border border-[#E5E5E5] p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
            <div className="flex shrink-0">
              <img src="/assets/icons/note.svg" alt="icon" />
            </div>
            <textarea
              name="notes"
              rows={6}
              className="w-full resize-none appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
              placeholder="Additional notes for courier"
            />
          </div>
          <div className="flex items-center gap-[10px] rounded-full border border-[#E5E5E5] p-[12px_20px] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#FFC736]">
            <div className="flex shrink-0">
              <img src="/assets/icons/call.svg" alt="icon" />
            </div>
            <input
              type="tel"
              name="phone"
              className="w-full appearance-none font-semibold text-black outline-none placeholder:font-normal placeholder:text-[#616369]"
              placeholder="Write your phone number or whatsapp"
              required
            />
          </div>
        </div>

        {state.error && (
          <p className="rounded-full bg-red-50 px-5 py-3 text-sm font-medium text-red-600">
            {state.error}
          </p>
        )}
      </div>

      {/* Payment Details */}
      <div className="flex h-fit flex-1 shrink-0 flex-col gap-4">
        <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
          Payment Details
        </h2>
        <div className="flex w-full flex-col gap-[30px] rounded-3xl border border-[#E5E5E5] bg-white p-[30px]">
          {/* Guarantee banner */}
          <div className="flex w-full items-center justify-between gap-2 rounded-3xl border border-[#E5E5E5] bg-white p-5">
            <div className="flex items-center gap-[10px]">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
                <img src="/assets/icons/cake.svg" alt="icon" />
              </div>
              <div className="flex flex-col gap-[2px]">
                <p className="font-semibold text-gray-900">
                  100% It&apos;s Original
                </p>
                <p className="text-sm text-[#6A7789]">
                  We don&apos;t sell fake products
                </p>
              </div>
            </div>
            <div className="flex shrink-0">
              <img src="/assets/icons/arrow-right.svg" alt="icon" />
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex shrink-0">
                  <img src="/assets/icons/tick-circle.svg" alt="check" />
                </div>
                <p className="text-gray-700">Sub Total</p>
              </div>
              <p className="font-semibold text-gray-900">
                {rupiahFormat(grandTotal)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex shrink-0">
                  <img src="/assets/icons/tick-circle.svg" alt="check" />
                </div>
                <p className="text-gray-700">Insurance 12%</p>
              </div>
              <p className="font-semibold text-gray-900">Rp 0</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex shrink-0">
                  <img src="/assets/icons/tick-circle.svg" alt="check" />
                </div>
                <p className="text-gray-700">Shipping (Flat)</p>
              </div>
              <p className="font-semibold text-gray-900">Rp 0</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex shrink-0">
                  <img src="/assets/icons/tick-circle.svg" alt="check" />
                </div>
                <p className="text-gray-700">Warranty Original</p>
              </div>
              <p className="font-semibold text-gray-900">Rp 0</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex shrink-0">
                  <img src="/assets/icons/tick-circle.svg" alt="check" />
                </div>
                <p className="text-gray-700">PPN 11%</p>
              </div>
              <p className="font-semibold text-gray-900">Rp 0</p>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-gray-900">Grand Total</p>
            <p className="text-[32px] font-bold leading-[48px] text-[#0D5CD7] underline">
              {rupiahFormat(grandTotal)}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <SubmitButton isPending={isPending} />
            <button
              type="button"
              className="rounded-full border border-[#E5E5E5] bg-white p-[12px_24px] text-center font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:bg-[#0D5CD7]/5 hover:text-[#0D5CD7] hover:shadow-md"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
