import Link from "next/link"
import { headers } from "next/headers"
import { PackageIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import { LandingNavbar } from "@/components/landing/landing-navbar"

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

export default async function OrdersPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-svh bg-white">
      <header className="h-[480px] -mb-[310px] bg-[#EFF3FA] pt-[30px]">
        <LandingNavbar user={user} />
      </header>
      <div className="container mx-auto flex max-w-[1130px] flex-col items-center justify-center py-32">
        <div className="flex size-20 items-center justify-center rounded-full bg-[#EFF3FA]">
          <PackageIcon className="size-10 text-[#6A7789]" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-sm text-[#6A7789]">Coming soon — your order history will appear here.</p>
        <Link href="/catalogs" className="mt-6 rounded-full bg-[#0D5CD7] px-6 py-3 font-semibold text-white transition-all hover:bg-[#0D5CD7]/90">
          Browse Products
        </Link>
      </div>
    </div>
  )
}
