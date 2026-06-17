"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LocationForm } from "@/components/location-form"
import { deleteLocationAction } from "@/app/(admin)/dashboard/locations/actions"

type Location = { id: string; name: string }

export function LocationList({ locations }: { locations: Location[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)

  return (
    <>
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => { setEditing(null); setFormOpen(true) }} size="sm">
          <PlusIcon className="mr-1 size-4" />
          New Location
        </Button>
      </div>
      {locations.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No locations yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(l); setFormOpen(true) }}>
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                      onClick={() => startTransition(async () => { const r = await deleteLocationAction(l.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <LocationForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }} location={editing} />
    </>
  )
}
