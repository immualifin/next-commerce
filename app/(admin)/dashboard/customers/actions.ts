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
    await prisma.user.delete({ where: { id } })
  } catch {
    return { message: "Failed to delete customer." }
  }
  revalidatePath("/dashboard/customers")
  return { message: "Customer deleted successfully." }
}
