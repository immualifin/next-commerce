"use client"

import { useEffect } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 })

/**
 * Thin progress bar during link-click navigation only.
 * Does NOT override history.pushState — Next.js App Router
 * owns those methods; interfering causes navigation loops.
 */
export default function ProgressBar() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      if (!link) return

      const href = link.getAttribute("href")
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.getAttribute("target") === "_blank" ||
        link.hasAttribute("download")
      )
        return

      NProgress.start()
      timer = setTimeout(() => NProgress.done(), 5000)
    }

    function handleDone() {
      clearTimeout(timer)
      NProgress.done()
    }

    document.addEventListener("click", handleClick, true)
    window.addEventListener("pageshow", handleDone)
    window.addEventListener("load", handleDone)

    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("pageshow", handleDone)
      window.removeEventListener("load", handleDone)
      clearTimeout(timer)
    }
  }, [])

  return null
}
