"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    email: string;
    color: string;
    gradient: boolean;
    gradientColor2?: string;
    className?: string;
}

export function UserAvatar({ email, color, gradient, gradientColor2, className }: UserAvatarProps) {
    const fallbackText = (email?.charAt(0) || "U").toUpperCase();

    const style = {
        backgroundColor: gradient ? undefined : color,
        backgroundImage: gradient
            ? `linear-gradient(to bottom right, ${color}, ${gradientColor2 || "#868f96"})`
            : undefined,
    };

    // Determine font size based on avatar size from className
    const isLarge = className?.includes("h-24") || className?.includes("w-24");
    const textSize = isLarge ? "text-4xl" : "text-sm";

    return (
        <Avatar className={cn("h-8 w-8", className)} style={style}>
            <AvatarFallback className={cn("bg-transparent text-white", textSize)}>
                {fallbackText}
            </AvatarFallback>
        </Avatar>
    );
}
