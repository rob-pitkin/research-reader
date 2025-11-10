"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarButtonProps {
    isStarred: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export function StarButton({ isStarred, onClick, disabled }: StarButtonProps) {
    return (
        <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
            <Star
                className={cn(
                    "h-4 w-4 transition-colors",
                    isStarred ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground",
                )}
            />
            <span className="sr-only">{isStarred ? "Unstar" : "Star"}</span>
        </Button>
    );
}
