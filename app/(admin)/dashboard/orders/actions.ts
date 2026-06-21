"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import prisma from "@/lib/prisma"

const orderFormSchema = z.object({
  code: z.string().min(1, "Order code is required"),
  userId: z.string().min(1, "Customer is required"),
  total: z.coerce.number().int().min(0),
  status: z.enum(["pending", "success", "failed"]),
  // OrderDetail fields
  name: z.string().min(1, "Recipient name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  notes: z.string().optional().default(""),
})

export type OrderState = {
  errors: Record<string, string[]> | null
  message: string | null
}

function parseOrderForm(formData: FormData) {
  return orderFormSchema.safeParse({
    code: formData.get("code"),
    userId: formData.get("userId"),
    total: formData.get("total"),
    status: formData.get("status"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    notes: formData.get("notes"),
  })
}

export async function createOrderAction(
  prevState: OrderState,
  formData: FormData
): Promise<OrderState> {
  const parsed = parseOrderForm(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  const { code, userId, total, status, name, phone, address, city, postalCode, notes } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: { code, userId, total, status },
      })
      await tx.orderDetail.create({
        data: { orderId: order.id, name, phone, address, city, postalCode, notes: notes || null },
      })
    })
  } catch (e) {
    console.error("[createOrder]", e)
    return { errors: null, message: "Failed to create order." }
  }

  revalidatePath("/dashboard/orders")
  return { errors: null, message: "Order created successfully." }
}

export async function updateOrderAction(
  id: string,
  prevState: OrderState,
  formData: FormData
): Promise<OrderState> {
  const parsed = parseOrderForm(formData)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  const { code, userId, total, status, name, phone, address, city, postalCode, notes } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { code, userId, total, status },
      })
      await tx.orderDetail.upsert({
        where: { orderId: id },
        create: { orderId: id, name, phone, address, city, postalCode, notes: notes || null },
        update: { name, phone, address, city, postalCode, notes: notes || null },
      })
    })
  } catch (e) {
    console.error("[updateOrder]", e)
    return { errors: null, message: "Failed to update order." }
  }

  revalidatePath("/dashboard/orders")
  return { errors: null, message: "Order updated successfully." }
}

export async function deleteOrderAction(id: string) {
  try {
    await prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch (e) {
    console.error("[deleteOrder]", e)
    return { message: "Failed to delete order." }
  }
  revalidatePath("/dashboard/orders")
  return { message: "Order moved to trash." }
}

export async function restoreOrderAction(id: string) {
  try {
    await prisma.order.update({
      where: { id },
      data: { deletedAt: null },
    })
  } catch (e) {
    console.error("[restoreOrder]", e)
    return { message: "Failed to restore order." }
  }
  revalidatePath("/dashboard/orders")
  return { message: "Order restored successfully." }
}

export async function permanentDeleteOrderAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.orderDetail.deleteMany({ where: { orderId: id } })
      await tx.orderProduct.deleteMany({ where: { orderId: id } })
      await tx.order.delete({ where: { id } })
    })
  } catch (e) {
    console.error("[permanentDeleteOrder]", e)
    return { message: "Failed to permanently delete order." }
  }
  revalidatePath("/dashboard/orders")
  return { message: "Order permanently deleted." }
}
