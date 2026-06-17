"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { LayoutDashboardIcon, PackageIcon, ClipboardListIcon, UsersIcon, TagIcon, LayoutGridIcon, MapPinIcon, Settings2Icon, CircleHelpIcon, CommandIcon } from "lucide-react"

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: (
        <PackageIcon
        />
      ),
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: (
        <ClipboardListIcon
        />
      ),
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Brands",
      url: "/dashboard/brands",
      icon: (
        <TagIcon
        />
      ),
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: (
        <LayoutGridIcon
        />
      ),
    },
    {
      title: "Locations",
      url: "/dashboard/locations",
      icon: (
        <MapPinIcon
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Help",
      url: "/dashboard/help",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">NextCommerce</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
