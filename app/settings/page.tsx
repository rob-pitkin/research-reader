"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/user-avatar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarColor, setAvatarColor] = useState("#000000");
    const [avatarGradient, setAvatarGradient] = useState(false);
    const [avatarGradientColor2, setAvatarGradientColor2] = useState("#868f96");

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
                setAvatarGradientColor2(user.user_metadata?.avatar_gradient_color2 || "#868f96");
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
                avatar_gradient_color2: avatarGradientColor2,
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
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Avatar</CardTitle>
                    <CardDescription>Customize your avatar's appearance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <UserAvatar
                            email={user.email || ""}
                            color={avatarColor}
                            gradient={avatarGradient}
                            gradientColor2={avatarGradientColor2}
                            className="h-24 w-24"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="avatar-color">Color 1</Label>
                                <Input
                                    id="avatar-color"
                                    type="color"
                                    value={avatarColor}
                                    onChange={(e) => setAvatarColor(e.target.value)}
                                    className="w-24"
                                />
                            </div>
                            {avatarGradient && (
                                <div className="space-y-2">
                                    <Label htmlFor="avatar-gradient-color2">Color 2</Label>
                                    <Input
                                        id="avatar-gradient-color2"
                                        type="color"
                                        value={avatarGradientColor2}
                                        onChange={(e) => setAvatarGradientColor2(e.target.value)}
                                        className="w-24"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="avatar-gradient"
                            checked={avatarGradient}
                            onCheckedChange={setAvatarGradient}
                        />
                        <Label htmlFor="avatar-gradient">Enable Gradient</Label>
                    </div>
                    <Button onClick={handleSave}>Save</Button>
                </CardContent>
            </Card>
        </main>
    );
}
