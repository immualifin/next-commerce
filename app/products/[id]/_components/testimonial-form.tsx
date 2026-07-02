"use client"

import { useActionState, useRef, useEffect } from "react"
import { Star } from "lucide-react"
import { saveTestimonial } from "../actions"

const initialState = {
  errors: null as Record<string, string[]> | null,
  message: null as string | null,
  success: false,
}

export default function TestimonialForm({ productId, isLogin }: { productId: string; isLogin: boolean }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(saveTestimonial, initialState)

  // Reset form on success (only after action completes, not while pending)
  useEffect(() => {
    if (state.success && !isPending) {
      formRef.current?.reset()
    }
  }, [state.success, isPending])

  if (!isLogin) {
    return (
      <div className="rounded-2xl border border-[#E5E5E5] bg-[#F9FAFB] p-6 text-center">
        <p className="text-sm text-[#6A7789]">
          Please{" "}
          <a href="/sign-in" className="font-semibold text-[#0D5CD7] hover:underline">
            sign in
          </a>{" "}
          to write a testimonial.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-6">
      <h4 className="font-semibold text-gray-900">Write Your Testimonial</h4>

      <input type="hidden" name="productId" value={productId} />

      {/* Star rating */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <StarInput />
        {state.errors?.stars && (
          <p className="text-sm text-red-500">{state.errors.stars[0]}</p>
        )}
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-2">
        <label htmlFor="testimonial-text" className="text-sm font-medium text-gray-700">
          Your Testimonial
        </label>
        <textarea
          id="testimonial-text"
          name="text"
          rows={4}
          placeholder="Share your experience with this product..."
          className="w-full resize-none rounded-xl border border-[#E5E5E5] p-4 text-sm text-gray-900 placeholder:text-[#B0B8C1] focus:border-[#0D5CD7] focus:outline-none focus:ring-1 focus:ring-[#0D5CD7]"
        />
        {state.errors?.text && (
          <p className="text-sm text-red-500">{state.errors.text[0]}</p>
        )}
      </div>

      {/* Messages */}
      {state.success && (
        <p className="text-sm font-medium text-green-600">
          🎉 Thank you! Your testimonial has been submitted.
        </p>
      )}
      {!state.success && state.message && (
        <p className="text-sm font-medium text-red-500">{state.message}</p>
      )}

      {/* Submit */}
      <SubmitButton isPending={isPending} />
    </form>
  )
}

/** Interactive star rating — renders hidden input named "stars" */
function StarInput() {
  // We use a native radio-group approach via hidden input + clickable buttons.
  // Each star button sets the hidden input's value before form submission.
  return (
    <div className="flex items-center gap-1" data-star-input>
      <input type="hidden" name="stars" value="0" data-star-value />
      {Array.from({ length: 5 }).map((_, i) => {
        const starIndex = i + 1
        return (
          <button
            key={i}
            type="button"
            data-star={starIndex}
            onClick={(e) => {
              const container = e.currentTarget.closest("[data-star-input]")
              if (!container) return
              const hidden = container.querySelector("[data-star-value]") as HTMLInputElement
              if (!hidden) return

              // Toggle: clicking same star deselects
              const current = Number(hidden.value)
              hidden.value = current === starIndex ? "0" : String(starIndex)

              // Update visual state on all stars in this group
              const newVal = Number(hidden.value)
              const buttons = container.querySelectorAll("[data-star]")
              buttons.forEach((btn) => {
                const s = Number((btn as HTMLElement).dataset.star)
                const svg = btn.querySelector("svg")
                if (!svg) return
                if (s <= newVal) {
                  svg.setAttribute("fill", "#FFC736")
                  svg.setAttribute("stroke", "#FFC736")
                } else {
                  svg.setAttribute("fill", "none")
                  svg.setAttribute("stroke", "#D1D5DB")
                }
              })
            }}
            className="transition-transform hover:scale-110"
            aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
          >
            <Star className="size-6 text-gray-300" fill="none" />
          </button>
        )
      })}
    </div>
  )
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D5CD7] p-[12px_24px] text-center font-semibold text-white transition-all hover:bg-[#0A4BB5] hover:shadow-lg hover:shadow-[#0D5CD7]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#0D5CD7] disabled:hover:shadow-none"
    >
      {isPending ? "Submitting..." : "Submit Testimonial"}
    </button>
  )
}
