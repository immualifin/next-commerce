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
import { updateCustomerAction } from "@/app/(admin)/dashboard/customers/actions"

type Customer = {
  id: string
  name: string
  email: string
  rule: string
}

export function CustomerForm({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}) {
  const action = customer
    ? updateCustomerAction.bind(null, customer.id)
    : undefined

  const [state, formAction, isPending] = useActionState(
    action ?? (() => Promise.resolve({ errors: null, message: null })),
    { errors: null, message: null }
  )
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) { toast.success(state.message); onOpenChange(false); router.refresh() }
    if (state.message && state.errors) { toast.error(state.message) }
  }, [state, onOpenChange, router])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Customer</SheetTitle>
          <SheetDescription>
            Update customer details and role.
          </SheetDescription>
        </SheetHeader>
        {action && (
          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={customer?.name ?? ""} required />
              {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" defaultValue={customer?.email ?? ""} required type="email" />
              {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rule">Role</Label>
              <Select name="rule" defaultValue={customer?.rule ?? "customer"}>
                <SelectTrigger id="rule">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {state.errors?.rule && <p className="text-sm text-destructive">{state.errors.rule[0]}</p>}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Update"}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
