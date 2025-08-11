"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface Collection {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export default function CollectionsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionDescription, setNewCollectionDescription] = useState("");

    const fetchCollections = useCallback(
        async (userId: string) => {
            const { data, error } = await supabase
                .from("collections")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching collections:", error);
                toast.error("Failed to fetch your collections.");
            } else {
                setCollections(data as Collection[]);
            }
        },
        [supabase],
    );

    useEffect(() => {
        const getUserAndCollections = async () => {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
                await fetchCollections(user.id);
            }
            setLoading(false);
        };
        getUserAndCollections();
    }, [supabase, router, fetchCollections]);

    const handleCreateCollection = async () => {
        if (!user || !newCollectionName.trim()) {
            toast.error("Collection name cannot be empty.");
            return;
        }

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
            setCollections((prev) => [data[0], ...prev]);
            setNewCollectionName("");
            setNewCollectionDescription("");
            setIsDialogOpen(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center justify-between w-full px-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Collections</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Create Collection
                                </Button>
                            </DialogTrigger>
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
                                            onChange={(e) =>
                                                setNewCollectionDescription(e.target.value)
                                            }
                                            placeholder="A brief description of this collection."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleCreateCollection}>
                                        Save Collection
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>
                <main className="flex-1 p-4">
                    {loading ? (
                        <p>Loading your collections...</p>
                    ) : collections.length === 0 ? (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-semibold">No collections yet</h3>
                            <p className="text-muted-foreground">
                                Click "Create Collection" to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {collections.map((collection) => (
                                <Link href={`/collections/${collection.id}`} key={collection.id}>
                                    <Card className="hover:bg-muted/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle>{collection.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {collection.description || "No description"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground">
                                                Created on{" "}
                                                {new Date(
                                                    collection.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
