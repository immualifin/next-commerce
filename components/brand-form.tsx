"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { BrandState } from "@/app/(admin)/dashboard/brands/actions"
import { createBrandAction, updateBrandAction } from "@/app/(admin)/dashboard/brands/actions"

type Brand = {
  id: string
  name: string
  logo: string
}

export function BrandForm({
  open,
  onOpenChange,
  brand,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand?: Brand | null
}) {
  const isEditing = !!brand
  const action = isEditing
    ? updateBrandAction.bind(null, brand!.id)
    : createBrandAction

  const [state, formAction, isPending] = useActionState(action, {
    errors: null,
    message: null,
  })

  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) {
      toast.success(state.message)
      onOpenChange(false)
      router.refresh()
    }
    if (state.message && state.errors) {
      toast.error(state.message)
    }
  }, [state, onOpenChange, router])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Brand" : "New Brand"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the brand details below."
              : "Fill in the details to create a new brand."}
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={brand?.name ?? ""}
              required
              placeholder="Nike"
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              name="logo"
              defaultValue={brand?.logo ?? ""}
              required
              placeholder="https://example.com/logo.png"
            />
            {state.errors?.logo && (
              <p className="text-sm text-destructive">{state.errors.logo[0]}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
