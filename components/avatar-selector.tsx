"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
    user: User;
    avatars: string[];
}

export function AvatarSelector({ user, avatars }: AvatarSelectorProps) {
    const supabase = createClient();
    const currentUserAvatar = user.user_metadata.avatar_url || "";
    const [selectedAvatar, setSelectedAvatar] = useState(currentUserAvatar);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const { data, error } = await supabase.auth.updateUser({
            data: { avatar_url: selectedAvatar },
        });

        if (error) {
            toast.error("Failed to update avatar. Please try again.");
        } else {
            toast.success("Avatar updated successfully!");
            // Refresh the page to show the new avatar in the sidebar
            window.location.reload();
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Choose your avatar</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {avatars.map((avatar) => (
                    <div
                        key={avatar}
                        className={cn(
                            "relative w-20 h-20 rounded-full overflow-hidden cursor-pointer border-4",
                            selectedAvatar === `/avatars/${avatar}`
                                ? "border-primary"
                                : "border-transparent",
                        )}
                        onClick={() => setSelectedAvatar(`/avatars/${avatar}`)}
                    >
                        <Image
                            src={`/avatars/${avatar}`}
                            alt={avatar}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
            <Button onClick={handleSave} disabled={isSaving || selectedAvatar === currentUserAvatar}>
                {isSaving ? "Saving..." : "Save"}
            </Button>
        </div>
    );
}
