"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/use-cart"

/**
 * Clears the cart when the user returns from a successful Xendit payment.
 * Renders nothing — just a side effect.
 */
export default function CheckoutClearCart() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return null
}
