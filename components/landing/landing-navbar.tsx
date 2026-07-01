import Link from "next/link"

export function LandingNavbar() {
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
        <li className="font-bold text-[#FFC736] transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
          <Link href="/products">Shop</Link>
        </li>
        <li className="text-white transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
          <Link href="/#categories">Categories</Link>
        </li>
        <li className="text-white transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
          <Link href="/#testimonials">Testimonials</Link>
        </li>
        <li className="text-white transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
          <Link href="/#rewards">Rewards</Link>
        </li>
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
      </div>
    </nav>
  )
}
