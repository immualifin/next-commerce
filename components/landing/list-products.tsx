import { type ReactNode } from "react"
import { getProducts } from "@/app/_data/landing"
import CardProduct from "./card-product"

interface ListProductsProps {
  title: ReactNode
  isShowDetail?: boolean
}

export default async function ListProducts({
  title,
  isShowDetail = true,
}: ListProductsProps) {
  const products = await getProducts()

  return (
    <div id="picked" className="flex flex-col gap-[30px]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
          {title}
        </h2>
        {isShowDetail && (
          <a
            href="/products"
            className="rounded-full border border-[#E5E5E5] px-6 py-3 font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
          >
            Explore All
          </a>
        )}
      </div>
      <div className="grid grid-cols-5 gap-[30px]">
        {products.map((item) => (
          <CardProduct key={`${item.name}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  )
}
