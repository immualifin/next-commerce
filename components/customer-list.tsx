"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CustomerForm } from "@/components/customer-form"
import { deleteCustomerAction } from "@/app/(admin)/dashboard/customers/actions"

type Customer = {
  id: string
  name: string
  email: string
  rule: string
  createdAt: Date
}

export function CustomerList({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  return (
    <>
      {customers.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No customers yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                <TableCell>
                  <Badge variant={c.rule === "superadmin" ? "default" : "secondary"}>
                    {c.rule}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(c); setFormOpen(true) }}>
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                      onClick={() => startTransition(async () => { const r = await deleteCustomerAction(c.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <CustomerForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }} customer={editing} />
    </>
  )
}
