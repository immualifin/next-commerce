"use client"

import { useRef } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface CarouselImagesProps {
  images: string[]
  productName: string
}

/**
 * Horizontal scroll image carousel using CSS scroll-snap.
 * No extra dependencies — pure CSS + minimal JS for buttons.
 */
export default function CarouselImages({
  images,
  productName,
}: CarouselImagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const gap = 20
    const cardWidth = 470 + gap
    scrollRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    })
  }

  if (images.length === 0) {
    return (
      <div className="container mx-auto mt-[30px] flex max-w-[1130px]">
        <div className="flex h-[350px] w-[470px] shrink-0 items-center justify-center rounded-[30px] border border-[#E5E5E5] bg-white">
          <img
            src="/assets/icons/box.svg"
            alt="no image"
            className="size-16 opacity-30"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container relative mx-auto mt-[30px] max-w-[1130px]">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow transition-all hover:border-[#0D5CD7]"
      >
        <ChevronLeftIcon className="size-5 text-gray-600" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow transition-all hover:border-[#0D5CD7]"
      >
        <ChevronRightIcon className="size-5 text-gray-600" />
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex snap-x gap-5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <div
            key={img + i}
            className="flex h-[350px] w-[470px] shrink-0 snap-start items-center justify-center overflow-hidden rounded-[30px] border border-[#E5E5E5] bg-white p-10"
          >
            <img
              src={img}
              alt={`${productName} - ${i + 1}`}
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
