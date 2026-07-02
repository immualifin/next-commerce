import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import CartProducts from "./_components/cart-products"
import CheckoutForm from "./_components/checkout-form"

async function getCurrentUser() {
  try {
    const h = await headers()
    const cookieHeader = h.get("cookie")
    if (!cookieHeader) return null

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    })

    if (!session?.user) return null

    return {
      name: session.user.name ?? "User",
      image: session.user.image ?? null,
    }
  } catch {
    return null
  }
}

export default async function CartsPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-svh bg-white">
      {/* ── Header ── */}
      <header className="h-[480px] -mb-[310px] bg-[#EFF3FA] pt-[30px]">
        <LandingNavbar user={user} />
      </header>

      {/* ── Title: Breadcrumb + Heading ── */}
      <div
        id="title"
        className="container mx-auto flex max-w-[1130px] items-center justify-between"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <Link
              href="/catalogs"
              className="text-sm text-[#6A7789] transition-colors hover:text-black"
            >
              Shop
            </Link>
            <span className="text-sm text-[#6A7789]">/</span>
            <Link
              href="/catalogs"
              className="text-sm text-[#6A7789] transition-colors hover:text-black"
            >
              Browse
            </Link>
            <span className="text-sm text-[#6A7789]">/</span>
            <span className="text-sm text-black">Cart</span>
          </div>
          <h1 className="text-4xl font-bold leading-9 text-gray-900">
            My Shopping Cart
          </h1>
        </div>
      </div>

      {/* Cart items */}
      <CartProducts />

      {/* Checkout form (shipping + payment) */}
      <CheckoutForm />
    </div>
  )
}
