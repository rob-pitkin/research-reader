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
import { Check, FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateCollectionDialog } from "./create-collection-dialog";

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
    const [paperInCollections, setPaperInCollections] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const fetchCollectionsAndPaperStatus = async () => {
        if (!user) return;

        // Fetch user's collections
        const { data: collectionsData, error: collectionsError } = await supabase
            .from("collections")
            .select("id, name")
            .eq("user_id", user.id);

        if (collectionsError) {
            console.error("Failed to fetch collections", collectionsError);
            toast.error("Failed to fetch your collections.");
            return;
        }
        setCollections(collectionsData);

        // Fetch collections this paper is already in
        const { data: paperStatusData, error: paperStatusError } = await supabase
            .from("collection_papers")
            .select("collection_id")
            .eq("user_id", user.id)
            .eq("paper_id", paper.id);

        if (paperStatusError) {
            console.error("Failed to fetch paper status", paperStatusError);
            return;
        }
        setPaperInCollections(paperStatusData.map((item) => item.collection_id));
    };

    useEffect(() => {
        if (isOpen) {
            fetchCollectionsAndPaperStatus();
        }
    }, [isOpen, user, paper.id]);

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
            setPaperInCollections((prev) => [...prev, collectionId]);
        }
    };

    const handleCreateSuccess = async (newCollection: Collection) => {
        setCollections((prev) => [newCollection, ...prev]);
        // Immediately add the paper to the newly created collection
        await handleAddToCollection(newCollection.id);
    };

    return (
        <>
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
                        collections.map((collection) => {
                            const isPaperInCollection = paperInCollections.includes(collection.id);
                            return (
                                <DropdownMenuItem
                                    key={collection.id}
                                    onClick={() => handleAddToCollection(collection.id)}
                                    disabled={isPaperInCollection}
                                >
                                    {collection.name}
                                    {isPaperInCollection && (
                                        <Check className="ml-auto h-4 w-4 text-green-500" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })
                    ) : (
                        <DropdownMenuItem disabled>No collections found.</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create new collection...
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {user && (
                <CreateCollectionDialog
                    user={user}
                    isOpen={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onCreateSuccess={handleCreateSuccess}
                />
            )}
        </>
    );
}