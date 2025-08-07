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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, FileText, Calendar, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Paper {
    id: string;
    title: string;
    authors: string[];
    categories: string[];
    summary: string;
    published: string;
    links: { type: string; href: string }[];
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Paper[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get initial query from URL params
    useEffect(() => {
        const query = searchParams.get("q");
        if (query) {
            setSearchQuery(query);
            handleSearch(query);
        }
    }, [searchParams]);

    const handleSearch = async (query?: string) => {
        const queryToUse = query || searchQuery;
        if (!queryToUse.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/arxiv/search?q=${encodeURIComponent(queryToUse)}`);
            const data = await response.json();
            setSearchResults(data);

            // Update URL with search query
            const url = new URL(window.location.href);
            url.searchParams.set("q", queryToUse);
            window.history.replaceState({}, "", url.toString());
        } catch (error) {
            console.error("Error searching papers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewPDF = (pdfUrl: string, title: string) => {
        router.push(`/viewer?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(title)}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>ArXiv Search</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
                    {/* Search Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Search Research Papers
                        </h1>
                        <p className="text-muted-foreground">
                            Discover and explore academic papers from the ArXiv repository
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search for research papers... (e.g., 'machine learning', 'quantum computing')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="flex-1 h-12 text-lg"
                        />
                        <Button onClick={() => handleSearch()} disabled={isLoading} size="lg">
                            <Search className="h-4 w-4 mr-2" />
                            {isLoading ? "Searching..." : "Search"}
                        </Button>
                    </div>

                    {/* Results Count */}
                    {searchResults.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Found {searchResults.length} results</span>
                            {searchQuery && <span>for "{searchQuery}"</span>}
                        </div>
                    )}

                    {/* Search Results */}
                    <div className="grid gap-6">
                        {searchResults.map((paper) => (
                            <Card key={paper.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="space-y-3">
                                        <CardTitle className="text-xl leading-7 hover:text-blue-600 transition-colors">
                                            {paper.title}
                                        </CardTitle>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{paper.authors.slice(0, 3).join(", ")}</span>
                                                {paper.authors.length > 3 && (
                                                    <span>
                                                        and {paper.authors.length - 3} others
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(paper.published)}</span>
                                            </div>
                                        </div>

                                        {/* Categories */}
                                        {paper.categories && paper.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {paper.categories.slice(0, 4).map((category) => (
                                                    <Badge
                                                        key={category}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {category}
                                                    </Badge>
                                                ))}
                                                {paper.categories.length > 4 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{paper.categories.length - 4} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                                        {paper.summary}
                                    </p>

                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => {
                                                const pdfLink = paper.links.find(
                                                    (link) => link.type === "application/pdf",
                                                );
                                                if (pdfLink) {
                                                    handleViewPDF(pdfLink.href, paper.title);
                                                }
                                            }}
                                            className="gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            View PDF
                                        </Button>

                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={
                                                    paper.links.find(
                                                        (link) => link.type === "text/html",
                                                    )?.href ?? ""
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="gap-2"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View on ArXiv
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* No Results Message */}
                    {searchResults.length === 0 && searchQuery && !isLoading && (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Search className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No papers found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search terms or exploring different keywords
                            </p>
                            <Button variant="outline" onClick={() => setSearchQuery("")}>
                                Clear Search
                            </Button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="grid gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardHeader>
                                        <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-muted rounded" />
                                            <div className="h-4 bg-muted rounded w-5/6" />
                                            <div className="h-4 bg-muted rounded w-4/6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
