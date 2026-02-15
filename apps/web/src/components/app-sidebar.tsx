import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: Route;
  isActive?: boolean;
};

const navItems: NavItem[] = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Todo",
    url: "/todos",
  },
];

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-14 border-border border-b" />
      <SidebarContent className="px-2 py-4">
        {navItems.map((item) => (
          <SidebarMenu key={item.title}>
            <SidebarMenuItem>
              {/* FIXME: Cursor pointer only works on text, not the entire button */}
              <SidebarMenuButton isActive={item.isActive}>
                <Link href={item.url}>{item.title}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
