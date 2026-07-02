"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavbarUser {
  name: string
  image: string | null
}

interface LandingNavbarProps {
  user: NavbarUser | null
}

const NAV_LINKS = [
  { label: "Shop", href: "/catalogs" },
  { label: "Categories", href: "/#categories" },
  { label: "Brands", href: "/#brands" },
  { label: "Products", href: "/#products" },
] as const

function isActive(pathname: string, href: string): boolean {
  // Hash links are scroll-to-section anchors — never "active" by route
  if (href.startsWith("/#")) return false
  // Exact or child-route match
  if (href === "/") return pathname === "/"
  return pathname.startsWith(href)
}

export function LandingNavbar({ user }: LandingNavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="container mx-auto flex max-w-[1130px] items-center justify-between rounded-3xl bg-[#0D5CD7] p-5">
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/" className="text-xl font-bold text-white">
          Next Commerce
        </Link>
      </div>

      {/* Nav links */}
      <ul className="flex items-center gap-[30px]">
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href)
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`transition-all duration-300 hover:font-bold hover:text-[#FFC736] ${
                  active
                    ? "font-bold text-[#FFC736]"
                    : "text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Right side: Cart + Auth */}
      <div className="flex items-center gap-3">
        <Link href="/cart">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80">
            <img
              src="/assets/icons/cart.svg"
              alt="cart"
              className="size-12"
            />
          </div>
        </Link>

        {user ? (
          <Link href="/account" className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              Hi, {user.name.split(" ")[0]}
            </span>
            <div className="flex size-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E5E5E5] bg-white p-1">
              {user.image ? (
                <img
                  src={user.image}
                  className="size-full rounded-full object-cover"
                  alt={user.name}
                />
              ) : (
                <span className="text-sm font-semibold text-[#0D5CD7]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="rounded-full bg-white px-5 py-3 font-semibold text-[#0D5CD7] transition-all hover:bg-white/90"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-5 py-3 font-semibold text-[#0D5CD7] transition-all hover:bg-white/90"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
