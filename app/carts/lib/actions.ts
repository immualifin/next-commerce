"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { CartItem } from "@/hooks/use-cart"

// ── Schema ──

const shippingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  notes: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
})

// ── Helpers ──

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function getUserId(): Promise<string | null> {
  try {
    const h = await headers()
    const cookieHeader = h.get("cookie")
    if (!cookieHeader) return null

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    })
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

// ── Action ──

export async function storeOrder(
  _prevState: { error: string | null },
  formData: FormData,
  total: number,
  products: CartItem[],
): Promise<{ error: string | null }> {
  const userId = await getUserId()

  if (!userId) {
    redirect("/sign-in")
  }

  if (products.length === 0) {
    return { error: "Your cart is empty." }
  }

  const parsed = shippingSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    postal_code: formData.get("postal_code"),
    notes: formData.get("notes"),
    phone: formData.get("phone"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    // Create Order + OrderDetail + OrderProducts in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          code: generateCode(),
          userId,
          total,
          status: "pending",
        },
      })

      await tx.orderDetail.create({
        data: {
          orderId: o.id,
          name: parsed.data.name,
          address: parsed.data.address,
          city: parsed.data.city,
          postalCode: parsed.data.postal_code,
          notes: parsed.data.notes ?? "",
          phone: parsed.data.phone,
        },
      })

      await tx.orderProduct.createMany({
        data: products.map((p) => ({
          orderId: o.id,
          productId: p.id,
          quantity: p.quantity,
          subtotal: p.price * p.quantity,
        })),
      })

      return o
    })

    revalidatePath("/dashboard/orders")
    revalidatePath("/products")
  } catch (e) {
    console.error("[storeOrder]", e)
    return { error: "Failed to place order. Please try again." }
  }

  // Redirect to success page (or home for now)
  redirect("/?checkout=success")
}
