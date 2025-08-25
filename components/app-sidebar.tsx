"use client";

import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { BookOpen, Bot, LogIn, Settings2, SquareTerminal } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useState, useEffect } from "react";

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
        title: "Paper Search",
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
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

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
                {user ? (
                    <NavUser user={user} />
                ) : (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/login">
                                    <LogIn className="w-4 h-4" />
                                    <span>Login</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
