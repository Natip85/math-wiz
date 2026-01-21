"use client";

import type * as React from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import type { NavigationItems } from "./nav-types";
import { NavMain } from "./nav-main";
import { ChevronsLeft, ChevronsRight, LayoutDashboard, User2 } from "lucide-react";
import { AdminNavUser } from "./admin-nav-user";

const data: NavigationItems = {
  items: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard as React.ComponentType,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: User2 as React.ComponentType,
    },
  ],
  footerItems: [
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: Settings as React.ComponentType,
    // },
  ],
};

function CustomSidebarTrigger() {
  const { state } = useSidebar();
  return (
    <SidebarTrigger
      className={cn(
        "bg-background text-foreground hover:bg-sidebar hover:text-sidebar-foreground absolute top-14 -right-4 z-50 rounded-full border-0 transition-all duration-300 ease-in-out",
        "[&_svg]:transition-all [&_svg]:duration-300 [&_svg]:ease-in-out active:[&_svg]:scale-125",
        state === "collapsed" ? "cursor-e-resize" : "cursor-w-resize"
      )}
      variant="ghost"
      size="icon"
    >
      {state === "collapsed" ? <ChevronsRight /> : <ChevronsLeft />}
    </SidebarTrigger>
  );
}

export function AppSidebar({ children, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-border border-r" {...props}>
      <SidebarHeader>
        <CustomSidebarTrigger />
        <Link href="/" className="relative mt-4 mb-6 flex h-[24px] items-center justify-center">
          {/* Expanded state - full logo with text */}
          <span
            className={cn(
              "absolute left-1.5 flex items-center gap-5 transition-all duration-300 ease-in-out",
              state === "collapsed" ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          >
            <Image
              src="/logo.png"
              alt="Math Wiz Logo"
              width={50}
              height={50}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/dark-logo.png"
              alt="Math Wiz Logo"
              width={50}
              height={50}
              className="hidden dark:block"
              priority
            />
            <span className="text-lg font-semibold">math wiz</span>
          </span>
          {/* Collapsed state - icon/small logo */}
          <span
            className={cn(
              "absolute transition-all duration-300 ease-in-out",
              state === "collapsed" ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          >
            <Image
              src="/logo.png"
              alt="Math Wiz Logo"
              width={50}
              height={50}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/dark-logo.png"
              alt="Math Wiz Logo"
              width={50}
              height={50}
              className="hidden dark:block"
              priority
            />
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.items} footerItems={data.footerItems}>
          {children}
        </NavMain>
      </SidebarContent>
      <SidebarFooter>
        <Suspense>
          <AdminNavUser />
        </Suspense>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
