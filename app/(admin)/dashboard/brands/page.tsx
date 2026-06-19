import { TagIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import { BrandList } from "@/components/brand-list"

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <TagIcon className="size-5" />
            <h1 className="text-xl font-semibold">Brands</h1>
          </div>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Manage product brands.
          </p>
          <BrandList brands={serialize(brands)} />
        </div>
      </div>
    </div>
  )
}
