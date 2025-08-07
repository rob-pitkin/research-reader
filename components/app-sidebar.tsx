"use client";

import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

const navLinks = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
    },
    {
        title: "My Papers",
        url: "/papers",
        icon: BookOpen,
    },
    {
        title: "ArXiv Search",
        url: "/search",
        icon: Bot,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
    },
];

const collections = [
    {
        name: "Collections",
        url: "/collections",
        icon: BookOpen,
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent className="mt-2">
                <SidebarMenu>
                    {navLinks.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                <SidebarMenu>
                    {collections.map((col) => (
                        <SidebarMenuItem key={col.name}>
                            <SidebarMenuButton asChild>
                                <Link href={col.url}>
                                    <col.icon className="w-4 h-4" />
                                    <span>{col.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <NavUser
                    user={{ name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" }}
                />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
