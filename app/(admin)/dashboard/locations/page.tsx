import { MapPinIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import { LocationList } from "@/components/location-list"

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const isTrash = tab === "trash"

  const locations = await prisma.location.findMany({
    where: { deletedAt: isTrash ? { not: null } : null },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-5" />
            <h1 className="text-xl font-semibold">Locations</h1>
          </div>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Manage warehouse and store locations.</p>
          <LocationList
            locations={serialize(locations)}
            tab={isTrash ? "trash" : "active"}
          />
        </div>
      </div>
    </div>
  )
}
