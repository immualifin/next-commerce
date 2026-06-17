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
    await prisma.location.delete({ where: { id } })
  } catch {
    return { message: "Failed to delete location." }
  }
  revalidatePath("/dashboard/locations")
  return { message: "Location deleted successfully." }
}
