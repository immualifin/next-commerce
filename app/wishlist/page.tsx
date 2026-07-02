import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import WishlistItems from "./_components/wishlist-items"

async function getCurrentUser() {
  try {
    const h = await headers()
    const cookieHeader = h.get("cookie")
    if (!cookieHeader) return null
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    })
    if (!session?.user) return null
    return { name: session.user.name ?? "User", image: session.user.image ?? null }
  } catch {
    return null
  }
}

export default async function WishlistPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-svh bg-white">
      <header className="h-[480px] -mb-[310px] bg-[#EFF3FA] pt-[30px]">
        <LandingNavbar user={user} />
      </header>
      <div className="container mx-auto mt-[50px] max-w-[1130px] pb-[100px]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <Link href="/catalogs" className="text-sm text-[#6A7789] transition-colors hover:text-black">Shop</Link>
            <span className="text-sm text-[#6A7789]">/</span>
            <span className="text-sm text-black">Wishlist</span>
          </div>
          <h1 className="text-4xl font-bold leading-9 text-gray-900">My Wishlist</h1>
        </div>
        <WishlistItems />
      </div>
    </div>
  )
}
