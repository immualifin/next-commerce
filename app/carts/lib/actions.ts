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

async function getCurrentSession(): Promise<{
  userId: string
  email: string
} | null> {
  try {
    const h = await headers()
    const cookieHeader = h.get("cookie")
    if (!cookieHeader) return null

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    })
    if (!session?.user) return null

    return {
      userId: session.user.id,
      email: session.user.email ?? "",
    }
  } catch {
    return null
  }
}

/**
 * Create a Xendit Invoice and return the payment URL.
 */
async function createXenditInvoice(params: {
  externalId: string
  amount: number
  payerEmail: string
  description: string
}): Promise<string> {
  const secretKey = process.env.XENDIT_SECRET_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  if (!secretKey) {
    console.error("[Xendit] XENDIT_SECRET_KEY is not set")
    throw new Error("Payment configuration error")
  }

  const auth = Buffer.from(`${secretKey}:`).toString("base64")

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      currency: "IDR",
      payer_email: params.payerEmail || "customer@example.com",
      description: params.description,
      success_redirect_url: `${appUrl}/?checkout=success`,
      failure_redirect_url: `${appUrl}/carts?checkout=failed`,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[Xendit] Failed to create invoice", err)
    throw new Error("Failed to create payment invoice")
  }

  const data = await res.json()
  return data.invoice_url as string
}

// ── Action ──

export async function storeOrder(
  _prevState: { error: string | null },
  formData: FormData,
  total: number,
  products: CartItem[],
): Promise<{ error: string | null }> {
  const session = await getCurrentSession()

  if (!session) {
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

  const orderCode = generateCode()

  try {
    // Create Order + OrderDetail + OrderProducts in a transaction
    await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          code: orderCode,
          userId: session.userId,
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
    })

    revalidatePath("/dashboard/orders")
    revalidatePath("/products")

    // Create Xendit invoice and redirect to payment page
    const invoiceUrl = await createXenditInvoice({
      externalId: orderCode,
      amount: total,
      payerEmail: session.email,
      description: `Next Commerce Order #${orderCode}`,
    })

    redirect(invoiceUrl)
  } catch (e) {
    console.error("[storeOrder]", e)
    return { error: "Failed to place order. Please try again." }
  }
}
