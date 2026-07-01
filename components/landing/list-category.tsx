import Link from "next/link"
import { getCategories } from "@/app/_data/landing"

export default async function ListCategory() {
  const categories = await getCategories()

  return (
    <div id="categories" className="flex flex-col gap-[30px]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
          Browse Products <br /> by Categories
        </h2>
        <Link
          href="/products"
          className="rounded-full border border-[#E5E5E5] px-6 py-3 font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
        >
          Explore All
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-[30px]">
        {categories.map((item) => (
          <Link
            key={`${item.name}-${item.id}`}
            href={`/products?category=${item.id}`}
            className="categories-card"
          >
            <div className="flex w-full items-center gap-[14px] rounded-[20px] bg-white p-5 ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0D5CD7]">
                <img
                  src={`/assets/icons/${item.icon}`}
                  alt={item.name}
                  className="size-6"
                />
              </div>
              <div className="flex flex-col gap-[2px]">
                <p className="font-semibold leading-[22px] text-gray-900">
                  {item.name}
                </p>
                <p className="text-sm text-[#616369]">
                  {item._count.products} products
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
