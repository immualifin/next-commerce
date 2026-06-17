import { UsersIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { CustomerList } from "@/components/customer-list"

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, rule: true, createdAt: true },
  })

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            <h1 className="text-xl font-semibold">Customers</h1>
          </div>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">View and manage customer accounts.</p>
          <CustomerList customers={JSON.parse(JSON.stringify(customers))} />
        </div>
      </div>
    </div>
  )
}
