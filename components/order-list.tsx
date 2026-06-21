"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, PlusIcon, EyeIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { OrderForm } from "@/components/order-form"
import { deleteOrderAction, restoreOrderAction, permanentDeleteOrderAction } from "@/app/(admin)/dashboard/orders/actions"

type UserOption = { id: string; name: string; email: string }

type Order = {
  id: string
  code: string
  userId: string
  total: number
  status: string
  createdAt: Date
  deletedAt: Date | null
  user: { name: string; email: string }
  detail?: {
    name: string
    phone: string
    address: string
    city: string
    postalCode: string
    notes: string | null
  } | null
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  success: "default",
  failed: "destructive",
}

export function OrderList({
  orders,
  users,
  tab = "active",
}: {
  orders: Order[]
  users: UserOption[]
  tab?: "active" | "trash"
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Order | null>(null)
  const [viewing, setViewing] = useState<Order | null>(null)

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(v) => router.push(v === "trash" ? "?tab=trash" : "?")}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="trash">Trash</TabsTrigger>
          </TabsList>
          {tab === "active" && (
            <Button onClick={() => { setEditing(null); setFormOpen(true) }} size="sm">
              <PlusIcon className="mr-1 size-4" />
              New Order
            </Button>
          )}
        </div>
      </Tabs>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tab === "trash" ? "Trash is empty." : "No orders yet."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {tab === "trash" && <TableHead>Deleted</TableHead>}
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.code}</TableCell>
                <TableCell className="text-sm">
                  <div>{o.user?.name}</div>
                  <span className="text-xs text-muted-foreground">{o.user?.email}</span>
                </TableCell>
                <TableCell>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(o.total)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[o.status] ?? "secondary"}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString()}
                </TableCell>
                {tab === "trash" && (
                  <TableCell className="text-sm text-muted-foreground">
                    {o.deletedAt ? new Date(o.deletedAt).toLocaleDateString() : "—"}
                  </TableCell>
                )}
                <TableCell>
                  {tab === "active" ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => setViewing(o)}>
                        <EyeIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(o); setFormOpen(true) }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await deleteOrderAction(o.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await restoreOrderAction(o.id); toast.success(r?.message ?? "Restored."); router.refresh() })}>
                        <RotateCcwIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await permanentDeleteOrderAction(o.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === "active" && (
        <OrderForm
          open={formOpen}
          onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }}
          order={editing}
          users={users}
        />
      )}

      {/* Detail viewer */}
      <Sheet open={!!viewing} onOpenChange={() => setViewing(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Order {viewing?.code}</SheetTitle>
            <SheetDescription>Order details and shipping information.</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={statusVariant[viewing.status] ?? "secondary"}>{viewing.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Customer</span>
                <span className="text-sm font-medium">{viewing.user?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-medium">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(viewing.total)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">{new Date(viewing.createdAt).toLocaleString()}</span>
              </div>
              {viewing.detail && (
                <>
                  <hr />
                  <p className="text-sm font-medium">Shipping Info</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recipient</span>
                    <span className="text-sm">{viewing.detail.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm">{viewing.detail.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="text-sm text-right max-w-[200px]">{viewing.detail.address}, {viewing.detail.city} {viewing.detail.postalCode}</span>
                  </div>
                  {viewing.detail.notes && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Notes</span>
                      <span className="text-sm">{viewing.detail.notes}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
