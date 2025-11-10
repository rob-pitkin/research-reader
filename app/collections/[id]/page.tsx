"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Collection {
    id: string;
    name: string;
    description: string | null;
}

interface CollectionPaper {
    id: number;
    paper_id: string;
    title: string;
    summary: string;
    authors: string[];
    pdf_url: string | null;
    published_date: string | null;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function SingleCollectionPage({ params: paramsPromise }: PageProps) {
    const [params, setParams] = useState<{ id: string } | null>(null);
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [papers, setPapers] = useState<CollectionPaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const resolveParamsAndFetch = async () => {
            const resolvedParams = await paramsPromise;
            setParams(resolvedParams);
        };
        resolveParamsAndFetch();
    }, [paramsPromise]);

    const fetchCollectionDetails = useCallback(
        async (userId: string, collectionId: string) => {
            const { data, error } = await supabase
                .from("collections")
                .select("*")
                .eq("user_id", userId)
                .eq("id", collectionId)
                .single();
            if (error) {
                console.error("Error fetching collection details:", error);
                toast.error("Could not load collection details.");
                router.push("/collections");
            } else {
                setCollection(data);
            }
        },
        [supabase, router],
    );

    const fetchPapersInCollection = useCallback(
        async (userId: string, collectionId: string) => {
            const { data, error } = await supabase
                .from("collection_papers")
                .select("*")
                .eq("user_id", userId)
                .eq("collection_id", collectionId)
                .order("added_at", { ascending: false });

            if (error) {
                console.error("Error fetching papers:", error);
                toast.error("Could not load papers in this collection.");
            } else {
                setPapers(data as CollectionPaper[]);
            }
        },
        [supabase],
    );

    useEffect(() => {
        const getInitialData = async () => {
            if (!params) return;
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
                await fetchCollectionDetails(user.id, params.id);
                await fetchPapersInCollection(user.id, params.id);
            }
            setLoading(false);
        };
        getInitialData();
    }, [params, supabase, router, fetchCollectionDetails, fetchPapersInCollection]);

    const handleRemovePaper = async (paperId: number) => {
        if (!user) return;

        setPapers((prev) => prev.filter((p) => p.id !== paperId));

        const { error } = await supabase.from("collection_papers").delete().eq("id", paperId);

        if (error) {
            toast.error("Failed to remove paper.");
            console.error(error);
            // Re-fetch if error
            if (params) {
                fetchPapersInCollection(user.id, params.id);
            }
        }
    };

    const handleViewPDF = (pdfUrl: string, title: string) => {
        router.push(`/viewer?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(title)}`);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageHeader
                    breadcrumb={[
                        { label: "Collections", href: "/collections" },
                        { label: collection?.name || "Loading..." },
                    ]}
                />
                <main className="flex-1 p-4">
                    {loading ? (
                        <p>Loading papers...</p>
                    ) : papers.length === 0 ? (
                        <p>This collection is empty.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {papers.map((paper) => (
                                <Card key={paper.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{paper.title}</CardTitle>
                                        <CardDescription>
                                            {(paper.authors || []).join(", ")} •{" "}
                                            {formatDate(paper.published_date)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {paper.summary}
                                        </p>
                                        <div className="mt-4 flex gap-2">
                                            {paper.pdf_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewPDF(
                                                            paper.pdf_url ?? "",
                                                            paper.title,
                                                        )
                                                    }
                                                >
                                                    View PDF
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemovePaper(paper.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
