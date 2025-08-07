"use client";

import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { BookOpen, Bot, GalleryVerticalEnd, Settings2, SquareTerminal } from "lucide-react";
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
            <SidebarHeader>
                <TeamSwitcher
                    teams={[{ name: "Research Group", logo: GalleryVerticalEnd, plan: "Pro" }]}
                />
            </SidebarHeader>
            <SidebarContent>
                <nav className="flex flex-col gap-1 py-2">
                    {navLinks.map((item) => (
                        <Button
                            key={item.title}
                            asChild
                            variant="ghost"
                            className="justify-start gap-2 w-full"
                        >
                            <Link href={item.url}>
                                <item.icon className="w-4 h-4" />
                                {item.title}
                            </Link>
                        </Button>
                    ))}
                </nav>
                <div className="mt-6">
                    <div className="text-xs font-semibold text-muted-foreground px-4 mb-2">
                        Collections
                    </div>
                    <nav className="flex flex-col gap-1">
                        {collections.map((col) => (
                            <Button
                                key={col.name}
                                asChild
                                variant="ghost"
                                className="justify-start gap-2 w-full"
                            >
                                <Link href={col.url}>
                                    <col.icon className="w-4 h-4" />
                                    {col.name}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </div>
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
