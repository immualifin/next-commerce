import Link from "next/link"
import { rupiahFormat } from "@/lib/rupiah-format"

interface CardProductProps {
  item: {
    id: string
    image_url: string
    name: string
    category_name: string
    price: number
  }
}

export default function CardProduct({ item }: CardProductProps) {
  return (
    <Link href={`/products/${item.id}`} className="product-card">
      <div className="flex w-full flex-col gap-[24px] rounded-[20px] bg-white p-5 ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
        <div className="flex h-[90px] w-full shrink-0 items-center justify-center overflow-hidden">
          <img
            className="h-full object-contain"
            src={item.image_url}
            alt={item.name}
          />
        </div>
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-1">
            <p className="font-semibold leading-[22px] text-gray-900">
              {item.name}
            </p>
            <p className="text-sm text-[#616369]">{item.category_name}</p>
          </div>
          <p className="font-semibold leading-[22px] text-[#0D5CD7]">
            {rupiahFormat(item.price)}
          </p>
        </div>
      </div>
    </Link>
  )
}
