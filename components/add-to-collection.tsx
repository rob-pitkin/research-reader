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
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Paper {
    id: string;
    title: string;
    authors: string[];
    summary: string;
    published: string;
    links: { type: string; href: string }[];
}

interface Collection {
    id: string;
    name: string;
}

interface AddToCollectionProps {
    user: User;
    paper: Paper;
}

export function AddToCollection({ user, paper }: AddToCollectionProps) {
    const supabase = createClient();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchCollections = async () => {
            const { data, error } = await supabase
                .from("collections")
                .select("id, name")
                .eq("user_id", user.id);

            if (error) {
                console.error("Failed to fetch collections", error);
            } else {
                setCollections(data);
            }
        };

        fetchCollections();
    }, [isOpen, supabase, user.id]);

    const handleAddToCollection = async (collectionId: string) => {
        const { error } = await supabase.from("collection_papers").insert({
            collection_id: collectionId,
            user_id: user.id,
            paper_id: paper.id,
            title: paper.title,
            summary: paper.summary,
            authors: paper.authors,
            pdf_url: paper.links.find((link) => link.type === "application/pdf")?.href,
            published_date: paper.published,
        });

        if (error) {
            if (error.code === "23505") { // Unique constraint violation
                toast.info("This paper is already in that collection.");
            } else {
                toast.error("Failed to add paper to collection.");
                console.error(error);
            }
        } else {
            toast.success("Paper added to collection!");
        }
    };

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <FolderPlus className="h-4 w-4" />
                    <span className="sr-only">Add to Collection</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Add to a collection</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {collections.length > 0 ? (
                    collections.map((collection) => (
                        <DropdownMenuItem
                            key={collection.id}
                            onClick={() => handleAddToCollection(collection.id)}
                        >
                            {collection.name}
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>No collections found.</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
