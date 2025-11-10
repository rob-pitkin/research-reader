"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavUser({ user }: { user: User }) {
    const { isMobile } = useSidebar();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    const userName = user.user_metadata?.name || user.email;
    const avatarUrl = user.user_metadata?.avatar_url;
    const avatarColor = user.user_metadata?.avatar_color || "#000000";
    const avatarGradient = user.user_metadata?.avatar_gradient || false;
    const avatarGradientColor2 = user.user_metadata?.avatar_gradient_color2 || "#868f96";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {avatarUrl ? (
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={avatarUrl} alt={userName || "User"} />
                                    <AvatarFallback className="rounded-lg">
                                        {(userName?.charAt(0) || "U").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <UserAvatar
                                    email={user.email || ""}
                                    color={avatarColor}
                                    gradient={avatarGradient}
                                    gradientColor2={avatarGradientColor2}
                                />
                            )}
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{userName}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                {avatarUrl ? (
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={avatarUrl} alt={userName || "User"} />
                                        <AvatarFallback className="rounded-lg">
                                            {(userName?.charAt(0) || "U").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <UserAvatar
                                        email={user.email || ""}
                                        color={avatarColor}
                                        gradient={avatarGradient}
                                        gradientColor2={avatarGradientColor2}
                                    />
                                )}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{userName}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                                <ThemeToggle />
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
