"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Folder, User as UserIcon } from "lucide-react";

interface StarredPaper {
    id: number;
    paper_id: string;
    title: string;
    summary: string;
    authors: string[];
    pdf_url: string | null;
    published_date: string | null;
    created_at: string;
}

interface Collection {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [starredPapers, setStarredPapers] = useState<StarredPaper[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [quickSearchQuery, setQuickSearchQuery] = useState("");
    const [totalStarredPapers, setTotalStarredPapers] = useState(0);
    const [totalCollections, setTotalCollections] = useState(0);

    const handleQuickSearch = () => {
        if (quickSearchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(quickSearchQuery)}`);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch counts
            const { count: starredCount, error: starredCountError } = await supabase
                .from("papers")
                .select("count", { count: "exact" })
                .eq("user_id", user.id);
            if (starredCountError)
                console.error("Error fetching starred count:", starredCountError);
            else setTotalStarredPapers(starredCount || 0);

            const { count: collectionsCount, error: collectionsCountError } = await supabase
                .from("collections")
                .select("count", { count: "exact" })
                .eq("user_id", user.id);
            if (collectionsCountError)
                console.error("Error fetching collections count:", collectionsCountError);
            else setTotalCollections(collectionsCount || 0);

            // Fetch recently starred papers
            const { data: papersData, error: papersError } = await supabase
                .from("papers")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5);

            if (papersError) {
                console.error("Error fetching starred papers:", papersError);
            } else {
                setStarredPapers(papersData as StarredPaper[]);
            }

            // Fetch recently created collections
            const { data: collectionsData, error: collectionsError } = await supabase
                .from("collections")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5);

            if (collectionsError) {
                console.error("Error fetching collections:", collectionsError);
            } else {
                setCollections(collectionsData as Collection[]);
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, [supabase, router]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <PageHeader breadcrumb={[{ label: "Dashboard" }]} />
                    <main className="flex-1 p-4">
                        <p>Loading your personalized dashboard...</p>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageHeader breadcrumb={[{ label: "Dashboard" }]} />
                <main className="flex-1 p-4">
                    <h2 className="text-2xl font-bold mb-4">Welcome, {user?.email || "User"}!</h2>

                    <div className="flex gap-2 mb-8">
                        <Input
                            placeholder="Quick search for papers..."
                            value={quickSearchQuery}
                            onChange={(e) => setQuickSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                            className="flex-1"
                        />
                        <Button onClick={handleQuickSearch}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Starred Papers
                                </CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalStarredPapers}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Collections
                                </CardTitle>
                                <Folder className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalCollections}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Access Buttons */}
                    <section className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/settings" passHref>
                                <Button variant="outline">
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Select an Avatar
                                </Button>
                            </Link>
                            <Link href="/papers" passHref>
                                <Button variant="outline">
                                    <Star className="h-4 w-4 mr-2" />
                                    View Starred Papers
                                </Button>
                            </Link>
                            <Link href="/collections" passHref>
                                <Button variant="outline">
                                    <Folder className="h-4 w-4 mr-2" />
                                    View Collections
                                </Button>
                            </Link>
                        </div>
                    </section>

                    <section className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Recently Starred Papers</h3>
                            <Link href="/papers" passHref>
                                <Button variant="link">View All</Button>
                            </Link>
                        </div>
                        {starredPapers.length === 0 ? (
                            <p className="text-muted-foreground">
                                You haven't starred any papers yet. Start by searching!
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {starredPapers.map((paper) => (
                                    <Card key={paper.paper_id}>
                                        <CardHeader>
                                            <CardTitle className="text-lg line-clamp-1">
                                                {paper.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {(paper.authors || []).join(", ")} •{" "}
                                                {formatDate(paper.published_date)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {paper.summary}
                                            </p>
                                            {paper.pdf_url && (
                                                <Link
                                                    href={`/viewer?url=${encodeURIComponent(paper.pdf_url)}&title=${encodeURIComponent(paper.title)}`}
                                                    passHref
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                    >
                                                        View PDF
                                                    </Button>
                                                </Link>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Your Collections</h3>
                            <Link href="/collections" passHref>
                                <Button variant="link">View All</Button>
                            </Link>
                        </div>
                        {collections.length === 0 ? (
                            <p className="text-muted-foreground">
                                You haven't created any collections yet. Organize your papers!
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {collections.map((collection) => (
                                    <Link
                                        href={`/collections/${collection.id}`}
                                        key={collection.id}
                                    >
                                        <Card className="hover:bg-muted/50 transition-colors">
                                            <CardHeader>
                                                <CardTitle className="line-clamp-1">
                                                    {collection.name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {collection.description || "No description"}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-xs text-muted-foreground">
                                                    Created on {formatDate(collection.created_at)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
