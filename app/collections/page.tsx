"use client";

import { CreateCollectionDialog } from "@/components/create-collection-dialog";
import { PageHeader } from "@/components/page-header";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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

    const fetchCollections = useCallback(async (userId: string) => {
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
    }, [supabase]);

    useEffect(() => {
        const getUserAndCollections = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
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

    const handleCreateSuccess = (newCollection: Collection) => {
        setCollections((prev) => [newCollection, ...prev]);
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageHeader breadcrumb={[{ label: "Collections" }]}>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}> {/* <-- Dialog starts here */}
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create Collection
                            </Button>
                        </DialogTrigger>
                        {user && (
                            <CreateCollectionDialog
                                user={user}
                                isOpen={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                                onCreateSuccess={handleCreateSuccess}
                            />
                        )}
                    </Dialog> {/* <-- Dialog ends here */}
                </PageHeader>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                                Created on {new Date(collection.created_at).toLocaleDateString()}
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
