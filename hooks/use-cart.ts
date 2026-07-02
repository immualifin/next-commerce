"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string
  category_name: string
  quantity: number
}

interface CartState {
  products: CartItem[]
  addProduct: (cart: CartItem) => void
  increaseQuantity: (id: string) => void
  decreaseQuantity: (id: string) => void
  removeProduct: (id: string) => void
  clearCart: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (cart) =>
        set({
          products: [
            ...get().products.filter((item) => item.id !== cart.id),
            cart,
          ],
        }),

      increaseQuantity: (id) => {
        const newProducts = get().products.map((item) => {
          if (item.id === id) return { ...item, quantity: item.quantity + 1 }
          return item
        })
        set({ products: newProducts })
      },

      decreaseQuantity: (id) => {
        const newProducts = get()
          .products.map((item) => {
            if (item.id === id)
              return { ...item, quantity: item.quantity - 1 }
            return item
          })
          .filter((item) => item.quantity > 0)
        set({ products: newProducts })
      },

      removeProduct: (id) =>
        set({
          products: [...get().products.filter((item) => item.id !== id)],
        }),

      clearCart: () => set({ products: [] }),
    }),
    {
      name: "next-commerce-cart",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
