"use client";

import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "sonner";

interface CreateCollectionDialogProps {
    user: User;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateSuccess: (collection: {
        id: string;
        name: string;
        description: string | null;
        created_at: string;
    }) => void;
}

export function CreateCollectionDialog({
    user,
    isOpen,
    onOpenChange,
    onCreateSuccess,
}: CreateCollectionDialogProps) {
    const supabase = createClient();
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionDescription, setNewCollectionDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleCreateCollection = async () => {
        if (!user || !newCollectionName.trim()) {
            toast.error("Collection name cannot be empty.");
            return;
        }

        setIsSaving(true);
        const { data, error } = await supabase
            .from("collections")
            .insert({
                user_id: user.id,
                name: newCollectionName,
                description: newCollectionDescription,
            })
            .select();

        if (error) {
            console.error("Error creating collection:", error);
            toast.error("Failed to create collection.");
        } else {
            toast.success("Collection created successfully!");
            onCreateSuccess(data[0]);
            setNewCollectionName("");
            setNewCollectionDescription("");
            onOpenChange(false); // Close dialog
        }
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a new collection</DialogTitle>
                <DialogDescription>
                    Give your collection a name and an optional description.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="e.g., Machine Learning Papers"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={newCollectionDescription}
                        onChange={(e) => setNewCollectionDescription(e.target.value)}
                        placeholder="A brief description of this collection."
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleCreateCollection} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Collection"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
