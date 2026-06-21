"use server"

import { revalidatePath } from "next/cache"
import { customerSchema } from "@/lib/validations"
import prisma from "@/lib/prisma"

export type CustomerState = {
  errors: Record<string, string[]> | null
  message: string | null
}

export async function updateCustomerAction(
  id: string,
  prevState: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    rule: formData.get("rule"),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  const { name, email, rule } = parsed.data

  try {
    await prisma.user.update({ where: { id }, data: { name, email, rule } })
  } catch {
    return { errors: null, message: "Failed to update customer." }
  }

  revalidatePath("/dashboard/customers")
  return { errors: null, message: "Customer updated successfully." }
}

export async function deleteCustomerAction(id: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch (e) {
    console.error("[deleteCustomer]", e)
    return { message: "Failed to delete customer." }
  }
  revalidatePath("/dashboard/customers")
  return { message: "Customer moved to trash." }
}

export async function restoreCustomerAction(id: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    })
  } catch (e) {
    console.error("[restoreCustomer]", e)
    return { message: "Failed to restore customer." }
  }
  revalidatePath("/dashboard/customers")
  return { message: "Customer restored successfully." }
}

export async function permanentDeleteCustomerAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({ where: { userId: id }, select: { id: true } })
      const orderIds = orders.map((o) => o.id)
      if (orderIds.length > 0) {
        await tx.orderDetail.deleteMany({ where: { orderId: { in: orderIds } } })
        await tx.orderProduct.deleteMany({ where: { orderId: { in: orderIds } } })
        await tx.order.deleteMany({ where: { userId: id } })
      }
      await tx.session.deleteMany({ where: { userId: id } })
      await tx.account.deleteMany({ where: { userId: id } })
      await tx.user.delete({ where: { id } })
    })
  } catch (e) {
    console.error("[permanentDeleteCustomer]", e)
    return { message: "Failed to permanently delete customer." }
  }
  revalidatePath("/dashboard/customers")
  return { message: "Customer permanently deleted." }
}
