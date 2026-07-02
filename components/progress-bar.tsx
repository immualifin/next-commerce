"use client"

import { useEffect } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

// Configure NProgress
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 })

/**
 * Thin progress bar at the top of the page during route transitions.
 * Hooks into Next.js App Router navigation using click interception.
 */
export default function ProgressBar() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      if (!link) return

      // Only intercept internal navigations
      const href = link.getAttribute("href")
      if (!href || href.startsWith("http") || href.startsWith("#") ||
          href.startsWith("mailto:") || href.startsWith("tel:") ||
          link.getAttribute("target") === "_blank") return

      // Skip if this is a download link
      if (link.hasAttribute("download")) return

      NProgress.start()

      // If navigation doesn't complete in 5s, finish the bar
      timer = setTimeout(() => NProgress.done(), 5000)
    }

    function handleDone() {
      clearTimeout(timer)
      NProgress.done()
    }

    // Start bar on navigation start
    document.addEventListener("click", handleClick, true)

    // Finish bar on various navigation-complete indicators
    window.addEventListener("pageshow", handleDone)
    window.addEventListener("load", handleDone)

    // Also listen for popstate (back/forward)
    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)

    history.pushState = function (...args) {
      NProgress.start()
      timer = setTimeout(() => NProgress.done(), 5000)
      return originalPushState(...args)
    }
    history.replaceState = function (...args) {
      NProgress.start()
      timer = setTimeout(() => NProgress.done(), 5000)
      return originalReplaceState(...args)
    }

    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("pageshow", handleDone)
      window.removeEventListener("load", handleDone)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
      clearTimeout(timer)
    }
  }, [])

  return null
}
