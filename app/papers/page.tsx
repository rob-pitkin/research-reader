"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { StarButton } from "@/components/star-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface StarredPaper {
    id: number;
    user_id: string;
    paper_id: string;
    title: string;
    summary: string;
    authors: string[];
    pdf_url: string | null;
    published_date: string | null;
    created_at: string;
}

export default function StarredPapersPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [papers, setPapers] = useState<StarredPaper[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStarredPapers = useCallback(async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("papers")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching starred papers:", error);
        } else {
            setPapers(data as StarredPaper[]);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const getUserAndPapers = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
                fetchStarredPapers(user.id);
            }
        };
        getUserAndPapers();
    }, [supabase, router, fetchStarredPapers]);

    const handleUnstar = async (paperId: string) => {
        if (!user) return;

        // Optimistically remove from UI
        setPapers((prev) => prev.filter((p) => p.paper_id !== paperId));

        const { error } = await supabase
            .from("papers")
            .delete()
            .eq("user_id", user.id)
            .eq("paper_id", paperId);

        if (error) {
            console.error("Error unstarring paper:", error);
            // Re-fetch to get the correct state if error occurs
            fetchStarredPapers(user.id);
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
                <PageHeader breadcrumb={[{ label: "My Papers" }]} />
                <main className="flex-1 p-4">
                    {loading ? (
                        <p>Loading your papers...</p>
                    ) : papers.length === 0 ? (
                        <p>You haven't starred any papers yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {papers.map((paper) => (
                                <Card key={paper.paper_id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{paper.title}</CardTitle>
                                        <CardDescription>
                                            {(paper.authors || []).join(", ")} • {formatDate(paper.published_date)}
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
                                                    onClick={() => handleViewPDF(paper.pdf_url!, paper.title)}
                                                >
                                                    View PDF
                                                </Button>
                                            )}
                                            <StarButton
                                                isStarred={true}
                                                onClick={() => handleUnstar(paper.paper_id)}
                                            />
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
