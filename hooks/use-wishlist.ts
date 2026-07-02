"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type WishlistItem = {
  id: string
  name: string
  price: number
  image_url: string
  category_name: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id)
        if (exists) return // already saved
        set({ items: [...get().items, item] })
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      isInWishlist: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: "next-commerce-wishlist",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
