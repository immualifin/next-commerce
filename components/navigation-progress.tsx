"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function NavigationProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const start = useCallback(() => {
    const bar = barRef.current
    if (!bar) return
    clearTimeout(timerRef.current)
    // Reset instantly
    bar.style.transition = "none"
    bar.style.transform = "scaleX(0)"
    bar.offsetHeight // force reflow
    // Animate toward ~94%
    bar.style.transition = "transform 4s cubic-bezier(0.1, 0.8, 0.2, 1)"
    bar.style.transform = "scaleX(0.94)"
    bar.style.opacity = "1"
  }, [])

  const done = useCallback(() => {
    const bar = barRef.current
    if (!bar) return
    // Finish to 100%
    bar.style.transition = "transform 0.3s ease"
    bar.style.transform = "scaleX(1)"
    // Fade out and reset
    timerRef.current = setTimeout(() => {
      if (bar) {
        bar.style.opacity = "0"
        bar.style.transition = "none"
        bar.style.transform = "scaleX(0)"
      }
    }, 350)
  }, [])

  // Detect navigation complete when pathname/searchParams change
  useEffect(() => {
    done()
    return () => clearTimeout(timerRef.current)
  }, [pathname, searchParams, done])

  // Detect navigation start via link clicks (delegated, no history manipulation)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      if (!link) return

      const href = link.getAttribute("href")
      if (!href) return

      // Skip: external links, hash-only, javascript:, target=_blank, download
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        link.getAttribute("target") === "_blank" ||
        link.hasAttribute("download")
      ) {
        return
      }

      // Don't intercept if default was prevented or modifier key held
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }

      start()
    }

    document.addEventListener("click", handleClick, { capture: true })
    return () => document.removeEventListener("click", handleClick, { capture: true })
  }, [start])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 bg-transparent"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-[#0D5CD7]"
        style={{
          transform: "scaleX(0)",
          opacity: 0,
          boxShadow: "0 0 10px rgba(13, 92, 215, 0.5), 0 0 4px rgba(13, 92, 215, 0.3)",
        }}
      />
    </div>
  )
}
