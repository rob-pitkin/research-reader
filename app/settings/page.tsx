"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/user-avatar";
import { toast } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarColor, setAvatarColor] = useState("#000000");
    const [avatarGradient, setAvatarGradient] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
                setAvatarColor(user.user_metadata?.avatar_color || "#000000");
                setAvatarGradient(user.user_metadata?.avatar_gradient || false);
            }
            setLoading(false);
        };

        fetchUser();
    }, [supabase, router]);

    const handleSave = async () => {
        if (!user) return;

        const { error } = await supabase.auth.updateUser({
            data: {
                avatar_color: avatarColor,
                avatar_gradient: avatarGradient,
                avatar_url: null, // Clear the avatar_url so we use the new color avatar
            },
        });

        if (error) {
            toast.error("Failed to save your settings.");
            console.error(error);
        } else {
            toast.success("Settings saved!");
            router.refresh();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null; // or a redirect component
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageHeader breadcrumb={[{ label: "Settings" }]} />
                <main className="flex-1 p-4">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Avatar</h2>
                            <div className="flex items-center gap-4">
                                <UserAvatar
                                    email={user.email || ""}
                                    color={avatarColor}
                                    gradient={avatarGradient}
                                    className="h-24 w-24"
                                />
                                <div className="space-y-2">
                                    <div>
                                        <Label htmlFor="avatar-color">Background Color</Label>
                                        <Input
                                            id="avatar-color"
                                            type="color"
                                            value={avatarColor}
                                            onChange={(e) => setAvatarColor(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="avatar-gradient"
                                            checked={avatarGradient}
                                            onCheckedChange={setAvatarGradient}
                                        />
                                        <Label htmlFor="avatar-gradient">Enable Gradient</Label>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
