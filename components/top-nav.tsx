"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { BookOpen, Folder, LogOut, Menu, Search, Settings2, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
    },
    {
        title: "Search Papers",
        url: "/search",
        icon: Search,
    },
    {
        title: "My Papers",
        url: "/papers",
        icon: BookOpen,
    },
    {
        title: "Collections",
        url: "/collections",
        icon: Folder,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
    },
];

export function TopNav() {
    const pathname = usePathname();
    const router = useRouter();
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
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <nav className="border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="font-semibold text-lg">
                            Research Reader
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((item) => (
                            <Button
                                key={item.title}
                                variant="ghost"
                                asChild
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.url
                                        ? "text-primary"
                                        : "text-muted-foreground",
                                )}
                            >
                                <Link href={item.url}>{item.title}</Link>
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <UserAvatar
                                            email={user.email || ""}
                                            color={user.user_metadata?.avatar_color}
                                            gradient={user.user_metadata?.avatar_gradient}
                                            gradientColor2={
                                                user.user_metadata?.avatar_gradient_color2
                                            }
                                            className="h-8 w-8"
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                Account
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">
                                            <Settings2 className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <div className="md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {navLinks.map((item) => (
                                        <DropdownMenuItem key={item.title} asChild>
                                            <Link href={item.url}>{item.title}</Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
