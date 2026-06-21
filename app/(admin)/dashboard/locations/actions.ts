"use server"

import { revalidatePath } from "next/cache"
import { locationSchema } from "@/lib/validations"
import prisma from "@/lib/prisma"

export type LocationState = {
  errors: Record<string, string[]> | null
  message: string | null
}

export async function createLocationAction(
  prevState: LocationState,
  formData: FormData
): Promise<LocationState> {
  const parsed = locationSchema.safeParse({ name: formData.get("name") })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  try {
    await prisma.location.create({ data: { name: parsed.data.name } })
  } catch {
    return { errors: null, message: "Failed to create location." }
  }

  revalidatePath("/dashboard/locations")
  return { errors: null, message: "Location created successfully." }
}

export async function updateLocationAction(
  id: string,
  prevState: LocationState,
  formData: FormData
): Promise<LocationState> {
  const parsed = locationSchema.safeParse({ name: formData.get("name") })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  try {
    await prisma.location.update({ where: { id }, data: { name: parsed.data.name } })
  } catch {
    return { errors: null, message: "Failed to update location." }
  }

  revalidatePath("/dashboard/locations")
  return { errors: null, message: "Location updated successfully." }
}

export async function deleteLocationAction(id: string) {
  try {
    await prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch {
    return { message: "Failed to delete location." }
  }
  revalidatePath("/dashboard/locations")
  return { message: "Location moved to trash." }
}

export async function restoreLocationAction(id: string) {
  try {
    await prisma.location.update({
      where: { id },
      data: { deletedAt: null },
    })
  } catch {
    return { message: "Failed to restore location." }
  }
  revalidatePath("/dashboard/locations")
  return { message: "Location restored successfully." }
}

export async function permanentDeleteLocationAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { locationId: id }, select: { id: true } })
      const productIds = products.map((p) => p.id)
      if (productIds.length > 0) {
        await tx.orderProduct.deleteMany({ where: { productId: { in: productIds } } })
        await tx.product.deleteMany({ where: { locationId: id } })
      }
      await tx.location.delete({ where: { id } })
    })
  } catch (e) {
    console.error("[permanentDeleteLocation]", e)
    return { message: "Failed to permanently delete location." }
  }
  revalidatePath("/dashboard/locations")
  return { message: "Location permanently deleted." }
}
