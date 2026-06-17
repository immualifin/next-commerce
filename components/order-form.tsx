"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { createOrderAction, updateOrderAction } from "@/app/(admin)/dashboard/orders/actions"

type UserOption = { id: string; name: string; email: string }

type Order = {
  id: string
  code: string
  userId: string
  total: number
  status: string
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

export function OrderForm({
  open,
  onOpenChange,
  order,
  users,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: Order | null
  users: UserOption[]
}) {
  const isEditing = !!order
  const action = isEditing
    ? updateOrderAction.bind(null, order!.id)
    : createOrderAction

  const [state, formAction, isPending] = useActionState(action, { errors: null, message: null })
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) { toast.success(state.message); onOpenChange(false); router.refresh() }
    if (state.message && state.errors) { toast.error(state.message) }
  }, [state, onOpenChange, router])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Order" : "New Order"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update order details." : "Create a new customer order."}
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Order Code</Label>
            <Input id="code" name="code" defaultValue={order?.code ?? ""} required placeholder="ORD-001" />
            {state.errors?.code && <p className="text-sm text-destructive">{state.errors.code[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="userId">Customer</Label>
            <Select name="userId" defaultValue={order?.userId ?? ""}>
              <SelectTrigger id="userId">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.userId && <p className="text-sm text-destructive">{state.errors.userId[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="total">Total</Label>
            <Input id="total" name="total" defaultValue={order?.total?.toString() ?? "0"} required type="number" />
            {state.errors?.total && <p className="text-sm text-destructive">{state.errors.total[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={order?.status ?? "pending"}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.status && <p className="text-sm text-destructive">{state.errors.status[0]}</p>}
          </div>

          <hr className="my-2" />
          <p className="text-sm font-medium">Shipping Details</p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Recipient Name</Label>
            <Input id="name" name="name" defaultValue={order?.detail?.name ?? ""} required placeholder="John Doe" />
            {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={order?.detail?.phone ?? ""} required placeholder="08123456789" />
            {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={order?.detail?.address ?? ""} required placeholder="Jl. Merdeka No. 1" />
            {state.errors?.address && <p className="text-sm text-destructive">{state.errors.address[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={order?.detail?.city ?? ""} required placeholder="Jakarta" />
              {state.errors?.city && <p className="text-sm text-destructive">{state.errors.city[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" defaultValue={order?.detail?.postalCode ?? ""} required placeholder="12345" />
              {state.errors?.postalCode && <p className="text-sm text-destructive">{state.errors.postalCode[0]}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" defaultValue={order?.detail?.notes ?? ""} placeholder="Optional notes" />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
