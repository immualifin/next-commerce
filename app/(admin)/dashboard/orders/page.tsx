import { ClipboardListIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import { OrderList } from "@/components/order-list"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const isTrash = tab === "trash"

  const [orders, users] = await Promise.all([
    prisma.order.findMany({
      where: { deletedAt: isTrash ? { not: null } : null },
      orderBy: { createdAt: "desc" },
      include: { user: true, detail: true },
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <ClipboardListIcon className="size-5" />
            <h1 className="text-xl font-semibold">Orders</h1>
          </div>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Track and manage customer orders.</p>
          <OrderList
            orders={serialize(orders)}
            users={serialize(users)}
            tab={isTrash ? "trash" : "active"}
          />
        </div>
      </div>
    </div>
  )
}
