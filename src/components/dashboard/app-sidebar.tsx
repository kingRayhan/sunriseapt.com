"use client";

import {
  Building2Icon,
  CameraIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Admin",
    email: "admin@sunriseapt.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
    { title: "Properties", url: "/dashboard/properties", icon: Building2Icon },
    { title: "Blog", url: "/dashboard/blog", icon: FileTextIcon },
    {
      title: "Inquiries",
      url: "/dashboard/inquiries",
      icon: ClipboardListIcon,
    },
    // { title: "Team", url: "/dashboard/team", icon: UsersIcon },
    { title: "Gallery", url: "/dashboard/gallery", icon: CameraIcon },
  ],
  navSecondary: [
    { title: "View site", url: "/", icon: ExternalLinkIcon },
    { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
  ],
  // documents: [
  //   { name: "Reports", url: "/dashboard/reports", icon: ClipboardListIcon },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <img src="/full-logo.png" alt="" className="h-6 w-auto" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
