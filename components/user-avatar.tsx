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

    return (
        <Avatar className={cn("h-8 w-8 rounded-lg", className)} style={style}>
            <AvatarFallback className="rounded-lg bg-transparent text-white text-3xl">
                {fallbackText}
            </AvatarFallback>
        </Avatar>
    );
}
